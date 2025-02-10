import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { PollDto } from 'src/modules/poll/dto/poll.dto';

export function MatchLength(property: keyof PollDto, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'MatchLength',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          if (!Array.isArray(value)) return false;

          const relatedPropertyName = args.constraints[0] as keyof PollDto;
          const obj = args.object as PollDto;

          const relatedValue = obj[relatedPropertyName];
          return Array.isArray(relatedValue) && value.length === relatedValue.length;
        },
        defaultMessage(args: ValidationArguments) {
          const relatedPropertyName = args.constraints[0] as keyof PollDto;
          return `${args.property} must have the same length as ${relatedPropertyName}`;
        },
      },
    });
  };
}
