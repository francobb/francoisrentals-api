import {NextFunction, Request, Response} from "express";
import {firebaseApp} from "@clients/firebase.client";


export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];

  if (!idToken) {
    return res.status(401).send("Unauthorized");
  }

  try {
    (req as any).user = await firebaseApp.auth().verifyIdToken(idToken);
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).send("Unauthorized");
  }
};
