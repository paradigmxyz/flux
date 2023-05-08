import { useState, useEffect } from "react";
import { Button, Box, Spinner, Tooltip } from "@chakra-ui/react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

export const Whisper = ({
  onConvertedText,
  apiKey,
}: {
  onConvertedText: (text: string) => void;
  apiKey: string | null;
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [hasRecordingSupport, setHasRecordingSupport] = useState(false);
  const [isDesktopDevice, setIsDesktopDevice] = useState(false);

  const checkMediaRecordingSupport = () => {
    if (navigator.mediaDevices && MediaRecorder) {
      setHasRecordingSupport(true);
    } else {
      setHasRecordingSupport(false);
    }

    if (window.innerWidth > 1024) {
      setIsDesktopDevice(true);
    } else {
      setIsDesktopDevice(false);
    }
  };

  useEffect(() => {
    checkMediaRecordingSupport();
  }, []);

  const onDataAvailable = (e: BlobEvent) => {
    const formData = new FormData();
    formData.append("file", e.data, "recording.webm");
    formData.append("model", "whisper-1");

    setIsTranscribing(true);
    fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => onConvertedText(data.text))
      .catch((err) => console.error("Error:", err))
      .finally(() => setIsTranscribing(false));
  };

  const startRecording = async () => {
    setIsRecording(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => {
          track.stop();
        });

        if (stream.active) {
          stream.getTracks().forEach((track) => {
            stream.removeTrack(track);
          });
        }
      };

      recorder.addEventListener("dataavailable", onDataAvailable);
      recorder.start();
      setMediaRecorder(recorder);
    } catch (error) {
      console.error("Error starting recorder: ", error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    setIsRecording(false);
  };

  return (
    <>
      {hasRecordingSupport && isDesktopDevice && (
        <Box>
          <Tooltip
            label={
              isRecording
                ? "Stop Recording"
                : isTranscribing
                ? "Transcribing, please wait..."
                : "Record for Transcription"
            }
            openDelay={500}
            placement="top-start"
          >
            <Button
              position="absolute"
              marginTop={4}
              bottom={1}
              right={1}
              zIndex={10}
              variant="outline"
              border="0px"
              _hover={{ background: "none" }}
              p={1}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
            >
              {isRecording ? (
                <FaMicrophoneSlash />
              ) : isTranscribing ? (
                <Spinner size="sm" color={"#404040"} />
              ) : (
                <FaMicrophone />
              )}
            </Button>
          </Tooltip>
        </Box>
      )}
    </>
  );
};
