import base64 from "react-native-base64";

export const decodeColor = (value: string): string => {
  const code = base64.decode(value);

  switch (code) {
    case "B":
      return "blue";
    case "R":
      return "red";
    case "G":
      return "green";
    default:
      return "white";
  }
};
