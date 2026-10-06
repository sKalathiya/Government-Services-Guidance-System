from bullmq import UnrecoverableError


class EmbeddingWorkerException(Exception):
    pass

class PermanentException(UnrecoverableError):
    pass

class RetryableException(EmbeddingWorkerException):
    pass

class AiApiRateLimitException(RetryableException):
    pass

class AiApiServerException(RetryableException):
    pass

class AiApiNetworkException(RetryableException):
    pass

class AiApiBadRequestException(PermanentException):
    pass

class BadJobDataException(PermanentException):
    pass

class RetryableDatabaseException(RetryableException):
    pass

class ServiceNotFoundException(PermanentException):
    pass

class InvalidEmbeddingInputException(PermanentException):
    pass

class AiApiInvalidResponseException(RetryableException):
    pass
