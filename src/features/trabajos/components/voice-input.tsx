"use client";

import { useState, useRef } from "react";

type VoiceInputProps = {
	name: string;
	defaultValue?: string;
	placeholder?: string;
};

export function VoiceInput({ name, defaultValue = "", placeholder = "Escribe tu respuesta o pulsa para hablar" }: VoiceInputProps) {
	const [text, setText] = useState(defaultValue);
	const [audioData, setAudioData] = useState("");
	const [isRecording, setIsRecording] = useState(false);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);

	async function startRecording() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const mediaRecorder = new MediaRecorder(stream);
			mediaRecorderRef.current = mediaRecorder;
			chunksRef.current = [];

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					chunksRef.current.push(event.data);
				}
			};

			mediaRecorder.onstop = async () => {
				const blob = new Blob(chunksRef.current, { type: "audio/webm" });
				const reader = new FileReader();
				reader.onloadend = () => {
					const base64 = reader.result as string;
					setAudioData(base64);
				};
				reader.readAsDataURL(blob);
				stream.getTracks().forEach((track) => track.stop());
			};

			mediaRecorder.start();
			setIsRecording(true);
		} catch {
			alert("No se pudo acceder al micrófono");
		}
	}

	function stopRecording() {
		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
		}
	}

	function toggleRecording() {
		if (isRecording) {
			stopRecording();
		} else {
			startRecording();
		}
	}

	const finalValue = audioData || text;

	return (
		<div className="space-y-2">
			<div className="flex gap-2">
				<input
					type="text"
					value={text}
					onChange={(event) => {
						setText(event.target.value);
						setAudioData("");
					}}
					placeholder={placeholder}
					className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
				/>
				<button
					type="button"
					onClick={toggleRecording}
					className={`flex items-center justify-center rounded-full px-4 py-3 transition duration-200 ${
						isRecording
							? "bg-rose-500 text-white"
							: "bg-[var(--surface)] text-[var(--brand-deep)] hover:bg-[rgba(239,246,239,0.96)]"
					}`}
				>
					{isRecording ? (
						<>
							<span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-white" />
							Grabando...
						</>
					) : (
						"🎤"
					)}
				</button>
			</div>
			<input type="hidden" name={name} value={finalValue} />
		</div>
	);
}
