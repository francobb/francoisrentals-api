import axios from 'axios';
import PdfParse from 'pdf-parse';
import { Credentials } from 'google-auth-library';
import { google } from 'googleapis';
import GoogleClient from '@clients/gauth.client';
import Parser from '@utils/parser';
import TransactionService from '@services/transactions.service';
import googleModel from '@models/google.model';
import payeePayerModel from '@models/payeePayer.model';
import { HttpException } from '@exceptions/HttpException';
import { ID_OF_FOLDER } from '@utils/constants';
import { PayeePayer } from '@interfaces/payeePayer.interface';
import { logger } from '@utils/logger';
import ReportService from '@services/report.service';

interface GoogleOauthToken {
  access_token: string;
  id_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
  scope: string;
}

interface GoogleUserResult {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}
class GoogleService {
  public googleUser = googleModel;
  public jwtClient = GoogleClient.getJWTClient();
  public oauthClient = GoogleClient.getOAuthClient();
  public parser: Parser = new Parser();
  public payeesPayers = payeePayerModel;
  public transactionService: TransactionService = new TransactionService();
  public reportService = new ReportService();

  public async getAllPayeesAndPayers(): Promise<PayeePayer[]> {
    return this.payeesPayers.find();
  }

  public getAuthUrl() {
    return GoogleClient.generateAuthURL();
  }

  async getGoogleUser({ id_token, access_token }: { id_token: string; access_token: string }): Promise<GoogleUserResult> {
    try {
      const { data } = await axios.get<GoogleUserResult>(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      });
      return data;
    } catch (err: any) {
      logger.error(err);
      throw new HttpException(404, err.message);
    }
  }

  async authenticateWithGoogle(code: string): Promise<GoogleOauthToken> {
    let tr: any = {};

    const credentials = await this.googleUser.findOne();

    if (credentials) {
      // If credentials exist, set them in the OAuth2 client
      tr = credentials;
      this.oauthClient.setCredentials(credentials.toObject() as Credentials);
    } else {
      // If credentials don't exist, obtain them from Google and store them in the database
      const tokenResponse = await this.oauthClient.getToken(code);
      this.oauthClient.setCredentials(tokenResponse.tokens);
      tr = tokenResponse.tokens;
      const newCredentials = await this.googleUser.create(tokenResponse.tokens);
      await newCredentials.save();
    }

    // If the access token has expired, refresh it and update the database
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (this.oauthClient.isTokenExpiring()) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const refreshedCredentials = await this.oauthClient.refreshToken(this.oauthClient.credentials.refresh_token);

      this.oauthClient.setCredentials(refreshedCredentials.tokens);
      tr = refreshedCredentials.tokens;
      await this.googleUser.updateOne({}, refreshedCredentials.tokens);
    }

    return tr;
  }

  async listDriveFiles() {
    const filesFromDB = await this.reportService.getAllReports();
    const pp: PayeePayer[] = await this.getAllPayeesAndPayers();

    this.jwtClient.authorize(async (err, tokens) => {
      if (err) {
        logger.error(`Failed to authorize: ${err}`);
        return;
      }

      const drive = google.drive({ version: 'v3', auth: this.jwtClient });
      const { data } = await drive.files.list({
        pageSize: 10,
        q: `'${ID_OF_FOLDER}' in parents and trashed=false`,
        fields: 'nextPageToken, files(id, name)',
      });

      if (data.files && data.files.length) {
        for (const file of data.files as any) {
          const month = file.name.substring(0, 3);
          if (!filesFromDB.some(dbFile => month === dbFile.month)) {
            file['pdf'] = await this.exportFile(file.id);

            try {
              const pdf = await PdfParse(file.pdf);
              file.data = this.parser.collectReportData(pdf.text, pp);
              await this.transactionService.addManyTransactions(file.data);
              await this.reportService.addReport(file);
            } catch (err) {
              logger.error(err);
            }
          } else {
            logger.info('No New Files to upload');
          }
        }
      } else {
        logger.info('No files found.');
      }
    });
  }

  async exportFile(documentId: any) {
    return new Promise<Buffer>(async (resolve, reject) => {
      const bufferChunks: Buffer[] = [];

      const request = await google.drive('v3').files.get({ auth: this.jwtClient, fileId: documentId, alt: 'media' }, { responseType: 'stream' });

      request.data
        .on('error', err => {
          logger.error('Error downloading file.');
          reject(err);
        })
        .on('end', () => {
          const buffer = Buffer.concat(bufferChunks);
          resolve(buffer);
        })
        .on('data', chunk => {
          bufferChunks.push(chunk);
          if (process.stdout.isTTY) {
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
          }
        });
    });
  }
}

export default GoogleService;
