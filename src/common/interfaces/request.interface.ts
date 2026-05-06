import { IJwtPayload } from './jwt-payload.interface';

export interface IRequest extends Request {
  user?: IJwtPayload;
  params?: { [key: string]: string };
  body: any;
}
