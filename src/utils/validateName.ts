export default function validateName(value: string, setError: (e: string) => void): boolean {
	if (value.trim().length > 32 || value.trim().length < 1) {
		setError("You must enter a name between 1 and 32 characters long");
		return false;
	} else if (!/^[A-Za-z0-9_\- @.:&#'"]{1,32}$/.test(value.trim())) {
		setError("Your name must contain at least one letter or number, and contains only letters, numbers, and the following characters: _ - . : @ & # ' \"");
		return false;
	} else {
		setError("");
		return true;
	}

}
