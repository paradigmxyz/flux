import { useEffect, useState } from "react";

import {
  Box,
  BoxProps,
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Textarea,
} from "@chakra-ui/react";
import { Row } from "../../utils/chakra";
import { ExternalLinkIcon } from "@chakra-ui/icons";

export function LabeledSlider({
  label,
  value,
  setValue,
  color,
  max,
  min,
  step,
  precision,
  ...others
}: {
  label: string;
  value: number;
  setValue: (value: number) => void;
  color: string;
  max: number;
  min: number;
  step: number;
  precision: number;
} & BoxProps) {

  // Keep state for inputs that are invalid (being typed)
  const [incompleteInput, setIncompleteInput] = useState(false);
  const [inputStr, setInputStr] = useState("");
  const [defaultValue, setDefaultValue] = useState(value);

  // Handle input changes and update state accordingly
  const inputChangeHandler = (s: string, v: number) => {
    const isDecimalNotAllowed = precision === 0 && /\./.test(s);
    const isIncompleteInput = s === "" || (!isDecimalNotAllowed && /^\d+\.$/.test(s));
    
    setIncompleteInput(isIncompleteInput);
    setInputStr(s);
  
    if (!isIncompleteInput && !isDecimalNotAllowed) {
      setValue(isNaN(v) ? defaultValue : v);
    }
  };

  // Reset values to default if input is empty onBlur
  const handleBlur = (event?: React.FocusEvent<HTMLInputElement>) => {
    if (inputStr === "") {
      setIncompleteInput(false);
      setValue(defaultValue);
    }
  };

  // Reset value binding if input is invalid on slider click
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (incompleteInput) {
      setIncompleteInput(false);
    }
  };

  return (
    <Box {...others}>
      <Flex {...others} alignItems="center">
        <b>{label}:</b> 
        <NumberInput 
          size='xs' 
          maxW='75px' 
          ml='0.5rem' 
          step={step} 
          max={max} 
          min={min} 
          precision={precision} 
          value={incompleteInput ? inputStr : value}
          onChange={inputChangeHandler}
          onBlur={handleBlur}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </Flex>
      <Slider
        mx="2px"
        aria-label="temp-slider"
        value={value}
        onChange={(v) => setValue(v)}
        max={max}
        min={min}
        step={step}
        focusThumbOnChange={false}
        onClick={handleClick}
      >
        <SliderTrack>
          <SliderFilledTrack bg={color} />
        </SliderTrack>

        <SliderThumb />
      </Slider>
    </Box>
  );
}

export function LabeledInput({
  label,
  value,
  setValue,
  ...others
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
} & BoxProps) {
  return (
    <Box {...others}>
      <b>{label}:</b>
      <Input mt={1} onChange={(e) => setValue(e.target.value)} value={value} />
    </Box>
  );
}

export function LabeledPasswordInputWithLink({
  label,
  linkLabel,
  placeholder,
  link,
  value,
  setValue,
  ...others
}: {
  label: string;
  linkLabel: string;
  placeholder?: string;
  link: string;
  value: string;
  setValue: (value: string) => void;
} & BoxProps) {
  const [show, setShow] = useState(false);

  return (
    <Box {...others}>
      <Row mainAxisAlignment="space-between" crossAxisAlignment="center">
        <b>{label}:</b>
        <Link
          _focus={{ boxShadow: "none" }}
          href={link}
          isExternal
          fontSize="sm"
          color="green"
        >
          {linkLabel}
          <ExternalLinkIcon ml="5px" mb="3px" />
        </Link>
      </Row>
      <InputGroup size="md" borderBottom="0px" borderColor="#EEF2F6" mt={1}>
        <Input
          type={show ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
        />
        <InputRightElement width="auto">
          <Button
            width="55px"
            h="1.75rem"
            size="sm"
            bgColor="#EEEEEE"
            mr="6px"
            onClick={() => setShow(!show)}
          >
            {show ? "Hide" : "Show"}
          </Button>
        </InputRightElement>
      </InputGroup>
    </Box>
  );
}

export function LabeledTextArea({
  label,
  value,
  setValue,
  textAreaId,
  ...others
}: {
  label: string;
  value: string;
  textAreaId: string | undefined;
  setValue: (value: string) => void;
} & BoxProps) {
  return (
    <Box {...others} whiteSpace="pre-wrap">
      <b>{label}:</b>
      <Textarea
        mt={3}
        height="150px"
        onChange={(e) => setValue(e.target.value)}
        value={value}
        id={textAreaId}
        placeholder="Enter text here..."
      />
    </Box>
  );
}

export function SelfSelectingLabeledTextArea({
  label,
  value,
  setValue,
  id,
  ...others
}: {
  label: string;
  value: string;
  id: string;
  setValue: (value: string) => void;
} & BoxProps) {
  useEffect(
    () => (window.document.getElementById(id) as HTMLTextAreaElement | null)?.select(),
    []
  );

  return (
    <LabeledTextArea
      {...others}
      label={label}
      value={value}
      setValue={setValue}
      textAreaId={id}
    />
  );
}

export function LabeledSelect({
  label,
  value,
  setValue,
  options,
  ...others
}: {
  label: string;
  value: string;
  options: string[];
  setValue: (value: string) => void;
} & BoxProps) {
  return (
    <Box {...others}>
      <b>{label}:</b>
      <Select mt={2} onChange={(e) => setValue(e.target.value)} value={value}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </Select>
    </Box>
  );
}
