import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsEqual(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'notEquals',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const relatedPropertyName = args.constraints[0] as string;

          if (
            typeof relatedPropertyName !== 'string' ||
            typeof args.object !== 'object' ||
            args.object === null ||
            !(relatedPropertyName in args.object)
          ) {
            return false;
          }

          const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName];

          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be equal to ${args.constraints[0]}`;
        },
      },
    });
  };
}
