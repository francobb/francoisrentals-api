import axios from 'axios';
import { google } from 'googleapis';
import { Credentials } from 'google-auth-library';
import pdfParse from 'pdf-parse';
import { APP_SECRET, APP_ID, REDIRECT_URI } from '@config';
import googleModel from '@models/google.model';
import reportModel from '@models/report.model';
import { logger } from '@utils//logger';
import payeePayerModel from '@models/payeePayer.model';
import { PayeePayer } from '@interfaces/payeePayer.interface';
import ParserService from '@services/parser.service';
import TransactionService from '@services/transactions.service';

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
  public files = [];
  public payeesPayers = payeePayerModel;
  public googleUser = googleModel;
  public parserService: ParserService = new ParserService();
  public transactionService: TransactionService = new TransactionService();
  public oauth2Client = new google.auth.OAuth2(APP_ID, APP_SECRET, REDIRECT_URI);

  public async getAllPayeesAndPayers() {
    const pp: PayeePayer[] = await this.payeesPayers.find();
    return pp;
  }

  getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
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

  getGoogleUser = async ({ id_token, access_token }: { id_token: string; access_token: string }): Promise<GoogleUserResult> => {
    try {
      const { data } = await axios.get<GoogleUserResult>(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      });
      return data;
    } catch (err: any) {
      console.log(err);
      throw Error(err);
    }
  };
  async authenticateWithGoogle(code: string): Promise<GoogleOauthToken> {
    let tr: any = {};
    // Create a new OAuth2 client if it doesn't exist yet
    // const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

    // Check if the user's credentials are already stored in the database
    const credentials = await this.googleUser.findOne();

    if (credentials) {
      // If credentials exist, set them in the OAuth2 client
      tr = credentials;
      this.oauth2Client.setCredentials(credentials.toObject() as Credentials);
    } else {
      // If credentials don't exist, obtain them from Google and store them in the database
      const tokenResponse = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokenResponse.tokens);
      tr = tokenResponse.tokens;
      const newCredentials = await this.googleUser.create(tokenResponse.tokens);
      await newCredentials.save();
    }

    // If the access token has expired, refresh it and update the database
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (this.oauth2Client.isTokenExpiring()) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const refreshedCredentials = await this.oauth2Client.refreshToken(this.oauth2Client.credentials.refresh_token);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.oauth2Client.setCredentials(refreshedCredentials.tokens);
      tr = refreshedCredentials.tokens;
      await this.googleUser.updateOne({}, refreshedCredentials.tokens);
    }

    return tr;
  }

  async listDriveFiles() {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    const ID_OF_THE_FOLDER = '1jXtb1PHlAoHtHs3vfmSIgQF5rofvzO3Y';

    // List the user's files
    const { data } = await drive.files.list({
      pageSize: 10,
      q: `'${ID_OF_THE_FOLDER}' in parents and trashed=false`,
      fields: 'nextPageToken, files(id, name)',
    });

    const pp: PayeePayer[] = await this.getAllPayeesAndPayers();

    // Log the file names and IDs
    this.files = data.files;
    if (this.files && this.files.length) {
      for (const file of this.files) {
        if (file.name.includes('Mar_2023.pdf')) {
          file['pdf'] = await this.exportFile(file.id);
          await this.transactionService
            .addReport(file)
            .then(() =>
              pdfParse(file['pdf'])
                .then(pdf => {
                  file['text'] = pdf.text;
                  logger.info(` :::: START Parsing Data: ${file.name} :::: `);
                  file.data = this.parserService.collectReportData(pdf.text, pp);
                  this.transactionService.addManyTransactions(file.data);
                  logger.info(` :::: END Parsing Data: ${file.name} :::: `);
                })
                .catch(err => {
                  logger.error('Error parsing report' + err);
                }),
            )
            .catch(err => {
              logger.error(err);
            });
        }
      }
    } else {
      console.log('No files found.');
    }
  }

  async exportFile(documentId) {
    let buffer;
    let buffer2;

    // const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

    await google
      .drive('v3')
      .files.get({ auth: this.oauth2Client, fileId: documentId, alt: 'media' }, { responseType: 'stream' })
      .then(res => {
        return new Promise((resolve, reject) => {
          // {
          // const filePath = path.join(os.tmpdir(), uuid.v4());
          // console.log(`writing to ${filePath}`);
          // const dest = fs.createWriteStream(filePath);
          // const dest = fs.createWriteStream(`./pdfs/${uuid.v4()}.pdf`);
          // }
          let progress = 0;
          const buf = [];

          res.data
            .on('error', err => {
              console.error('Error downloading file.');
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
                process.stdout.write(`Downloaded ${progress} bytes `);
              }
            });
          // .pipe(dest)
        });
      })
      .catch(err => logger.error({ err }));
    return buffer;
  }

  async saveReport(file: { name: { split: (arg0: string) => [any, any] }; id: any; pdf: any }) {
    logger.info(`${file.name} (${file.id})`);
    const [month, year] = file.name.split('_');
    const report = new reportModel({ month, year: year.replace(/.pdf/gi, ''), data: file.pdf });
    return new Promise((resolve, reject) => {
      report.save((error, result) => {
        if (error) {
          // logger.error(error);
          // throw error;
          reject(error);
        }
        resolve(result);
      });
    });
  }
}

export default GoogleService;
