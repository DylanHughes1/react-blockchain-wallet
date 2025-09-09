import "@testing-library/jest-dom";
import React from "react";
import { vi } from "vitest";

vi.mock("@rainbow-me/rainbowkit/styles.css", () => ({}));

vi.mock("@mui/icons-material", () => {
  const Stub: React.FC<any> = (props) => React.createElement("span", props);
  return {
    __esModule: true,
    Add: Stub,
    CheckCircle: Stub,
    HourglassEmpty: Stub,
    Send: Stub,
    default: {},
  };
});
