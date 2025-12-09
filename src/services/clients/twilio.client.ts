import TwilioSDK, { Twilio } from 'twilio';
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } from '@config';
class TwilioClient {
  private static TwilioClient;

  private static initializeClient() {
    return new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
  private static initClient() {
    TwilioClient.TwilioClient = TwilioClient.initializeClient();
  }

  static getClient(): TwilioSDK.Twilio {
    if (!this.TwilioClient) this.initClient();
    return this.TwilioClient;
  }
}

export default TwilioClient;
