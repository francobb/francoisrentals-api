import axios from 'axios';
import { google } from 'googleapis';
import { Credentials } from 'google-auth-library';
import pdfParse from 'pdf-parse';
import GoogleClient from '@services/gauth.service';
import Parser from '@utils/parser';
import TransactionService from '@services/transactions.service';
import googleModel from '@models/google.model';
import payeePayerModel from '@models/payeePayer.model';
import { PayeePayer } from '@interfaces/payeePayer.interface';
import { logger } from '@utils//logger';
import { ID_OF_FOLDER } from '@utils/constants';

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
  constructor() {
    //
  }

  public async getAllPayeesAndPayers() {
    const pp: PayeePayer[] = await this.payeesPayers.find();
    return pp;
  }
  public getAuthUrl() {
    return this.oauthClient.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: 'offline',

      // scopes are documented here: https://developers.google.com/identity/protocols/oauth2/scopes#calendar
      scope: [
        'profile',
        'email',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.appdata',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.readonly',
      ],
      include_granted_scopes: true,
    });
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
      throw Error(err);
    }
  }
  async authenticateWithGoogle(code: string): Promise<GoogleOauthToken> {
    let tr: any = {};
    // Create a new OAuth2 client if it doesn't exist yet
    // const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

    // Check if the user's credentials are already stored in the database
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.oauthClient.setCredentials(refreshedCredentials.tokens);
      tr = refreshedCredentials.tokens;
      await this.googleUser.updateOne({}, refreshedCredentials.tokens);
    }

    return tr;
  }
  async listDriveFiles() {
    const filesFromDB = await this.transactionService.getAllReports();
    const pp: PayeePayer[] = await this.getAllPayeesAndPayers();

    this.jwtClient.authorize(async (err, tokens) => {
      if (err) {
        console.error(`Failed to authorize: ${err}`);
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

            await pdfParse(file.pdf)
              .then(async pdf => {
                file.data = this.parser.collectReportData(pdf.text, pp);
                await this.transactionService.addManyTransactions(file.data);
              })
              .then(() => {
                this.transactionService.addReport(file);
              })
              .catch(err => logger.error(err));
          }
        }
      } else {
        logger.error('No files found.');
      }
    });
  }
  async exportFile(documentId) {
    let buffer;
    let buffer2;

    await google
      .drive('v3')
      .files.get({ auth: this.jwtClient, fileId: documentId, alt: 'media' }, { responseType: 'stream' })
      .then(res => {
        return new Promise((resolve, reject) => {
          // { if I ever want to write files locally
          // const filePath = path.join(os.tmpdir(), uuid.v4());
          // console.log(`writing to ${filePath}`);
          // const dest = fs.createWriteStream(filePath);
          // const dest = fs.createWriteStream(`./pdfs/${uuid.v4()}.pdf`);
          // }
          let progress = 0;
          const buf = [];

          res.data
            .on('error', err => {
              logger.error('Error downloading file.');
              reject(err);
            })
            .on('end', () => {
              buffer = Buffer.concat(buf);
              buffer2 = Buffer.from(buffer).toString('base64');

              // dest.close();
              resolve(buffer);
            })
            .on('data', d => {
              progress += d.length;
              buf.push(d);
              if (process.stdout.isTTY) {
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                process.stdout.write(`Downloaded ${progress} bytes\n`);
              }
            });
          // .pipe(dest)
        });
      })
      .catch(err => logger.error({ err }));
    return buffer;
  }
}

export default GoogleService;
