import { Request, Response } from 'express';

class IndexController {
  public index = (req: Request, res: Response) => {
    res.sendStatus(200);
  };
}

export default IndexController;
