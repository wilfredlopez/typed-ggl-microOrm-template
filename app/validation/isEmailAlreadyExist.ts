import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationOptions,
  registerDecorator,
} from "class-validator";
import { DI } from "../index";

@ValidatorConstraint({ async: true })
export class IsEmailAlreadyExistConstrain
  implements ValidatorConstraintInterface {
  defaultMessage() {
    return "Email Already Exists";
  }
  async validate(email: string, _: ValidationArguments): Promise<boolean> {
    const user = await DI.userRepo.findOne({ email });

    if (user) {
      return false;
    }
    return true;
  }
}

export function IsEmailAlreadyExists(options?: ValidationOptions) {
  return function (obj: Object, propertyName: string) {
    registerDecorator({
      target: obj.constructor,
      propertyName,
      validator: IsEmailAlreadyExistConstrain,
      options: options,
      constraints: [],
    });
  };
}
