import React, { CSSProperties, ReactElement } from "react";
import { Button, Form, Spinner } from "react-bootstrap";

interface InputFormProps {
	label: string;
	buttonText: string;
	onSubmit: (value: string, setError: (error: string) => void, setLoading: (loading: boolean) => void) => void;
	validate: (value: string, setError: (error: string) => void) => boolean;
	transformer?: (value: string) => string;
	defaultValue?: string;
	autoFocus?: boolean;
	style?: CSSProperties;
}

export default function InputForm({
									  label,
									  buttonText,
									  onSubmit,
									  validate,
									  defaultValue,
									  autoFocus,
									  transformer,
									  style,
								  }: InputFormProps): ReactElement {
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState("");
	const [value, setValue] = React.useState(defaultValue || "");
	const transformerFn = transformer || ((v: string): string => v);

	return (
		<Form onSubmit={(e: React.FormEvent): void => {
			if (loading) return;
			e.preventDefault();
			if (validate(value, setError)) {
				setLoading(true);
				onSubmit(value, setError, setLoading);
			}
		}}>
			<Form.Group controlId="inputForm">
				<Form.Label><b>{label}:</b></Form.Label>
				<Form.Control
					isInvalid={!!error}
					type="text"
					value={value}
					disabled={loading}
					autoFocus={autoFocus}
					style={style}
					onChange={(e): void => {
						const val = transformerFn(e.target.value);
						if (validate(val, setError)) {
							setError("");
						}
						setValue(val);

					}}
				/>
				<Form.Control.Feedback type={"invalid"}>
					{error}
				</Form.Control.Feedback>
			</Form.Group>
			<Button type={"submit"} block disabled={loading}>{loading ?
				<Spinner animation={"border"} as={"span"} size="sm"/> : buttonText}</Button>
		</Form>
	);
}