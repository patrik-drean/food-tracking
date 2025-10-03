export class ValidationError extends Error {
  public field: string;

  constructor(message: string, field: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export function validateFoodDescription(description: string): void {
  if (!description || typeof description !== 'string') {
    throw new ValidationError('Food description is required', 'description');
  }

  const trimmed = description.trim();

  if (trimmed.length === 0) {
    throw new ValidationError('Food description cannot be empty', 'description');
  }

  if (trimmed.length > 200) {
    throw new ValidationError(
      'Food description must be 200 characters or less',
      'description'
    );
  }

  // Basic XSS prevention - reject descriptions with HTML-like content
  if (/<[^>]*>/g.test(trimmed)) {
    throw new ValidationError(
      'Food description contains invalid characters',
      'description'
    );
  }
}
