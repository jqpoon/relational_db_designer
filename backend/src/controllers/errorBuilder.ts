//  Error builder class with status code and error message

class ErrorBuilder {
	private code: number;
	private msg: string;

	public constructor(code: number, msg: string) {
		this.code = code;
		this.msg = msg;
	}

	public getCode(): number {
		return this.code;
	}

	public getMsg(): string {
		return this.msg;
	}
}

export default ErrorBuilder;
