import { intervalToDuration } from "date-fns";

const useFormatToDigits = () => {
  const formatToDigits = (seconds) => {
    const duration = intervalToDuration({ start: 0, end: seconds * 1000 });

    // Ensure hours, minutes, and seconds are always numbers
    const hours = (duration.hours || 0).toString().padStart(2, "0");
    const minutes = (duration.minutes || 0).toString().padStart(2, "0");
    const secs = (duration.seconds || 0).toString().padStart(2, "0");

    return `${hours}:${minutes}:${secs}`;
  };

  return { formatToDigits };
};

export default useFormatToDigits;
