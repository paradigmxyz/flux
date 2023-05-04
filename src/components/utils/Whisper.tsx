import { useState, useEffect } from "react";
import { Button, Flex } from "@chakra-ui/react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

export const Whisper = ({
  onConvertedText,
  apiKey,
}: {
  onConvertedText: (text: string) => void;
  apiKey: string | null;
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioData, setAudioData] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [hasRecordingSupport, setHasRecordingSupport] = useState<boolean>(false);

  const checkMediaRecordingSupport = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasRecordingSupport(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setHasRecordingSupport(true);
    } catch (error) {
      setHasRecordingSupport(false);
    }
  };

  useEffect(() => {
    checkMediaRecordingSupport();
  }, []);

  const startRecording = async () => {
    setIsRecording(true);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recorder.addEventListener("dataavailable", (e: BlobEvent) => {
      setAudioData(e.data);
      stream.getTracks().forEach((track) => track.stop());
    });

    recorder.start();
    setMediaRecorder(recorder);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async () => {
    if (!audioData || !apiKey) return;

    const formData = new FormData();
    formData.append("file", audioData, `audio_${Date.now()}.webm`);
    formData.append("model", "whisper-1");

    try {
      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        console.error("Whisper API error:", response.statusText);
        return;
      }

      const responseData = await response.json();
      onConvertedText(responseData.text);
      setAudioData(null);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <>
      {hasRecordingSupport && (
        <Flex mt={3}>
          {!isRecording && (
            <Button onClick={startRecording} leftIcon={<FaMicrophone />} mr={3}>
              Start Recording
            </Button>
          )}

          {isRecording && (
            <Button
              onClick={stopRecording}
              mr={3}
              bg={"#f14249"}
              _hover={{ bg: "#ed303f" }}
              leftIcon={<FaMicrophoneSlash />}
            >
              Stop Recording
            </Button>
          )}

          {audioData && (
            <Button onClick={transcribeAudio} colorScheme="blue">
              Transcribe Audio
            </Button>
          )}
        </Flex>
      )}
    </>
  );
};
