import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MintForm } from "../MintForm";

let writeContractMock: any;

vi.mock("wagmi", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useAccount: () => ({ address: "0x123" }),
    useWriteContract: () => ({
      writeContract: writeContractMock ?? vi.fn(),
      data: undefined,
      isPending: false,
      error: null,
    }),
    useWaitForTransactionReceipt: () => ({ isLoading: false, isSuccess: false }),
  };
});

const TOKEN = {
  address: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  decimals: 18,
  symbol: "TKN",
};

describe("MintForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders inputs and button", () => {
    render(<MintForm token={TOKEN} />);
    expect(screen.getByLabelText(/Recipient address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount \(TKN\)/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /mint/i })).toBeInTheDocument();
  });

  it("validates address and disables button for invalid input", async () => {
    const user = userEvent.setup();
    render(<MintForm token={TOKEN} />);
    const address = screen.getByLabelText(/Recipient address/i);
    const amount = screen.getByLabelText(/Amount \(TKN\)/i);
    const button = screen.getByRole("button", { name: /mint/i });

    await user.type(address, "not-an-address");
    await user.type(amount, "1");
    expect(button).toBeDisabled();
  });

  it("enables button for valid input and calls writeContract", async () => {
    const user = userEvent.setup();
    writeContractMock = vi.fn();
    render(<MintForm token={TOKEN} />);

    const address = screen.getByLabelText(/Recipient address/i);
    const amount = screen.getByLabelText(/Amount \(TKN\)/i);
    const button = screen.getByRole("button", { name: /mint/i });

    await user.clear(address);
    await user.type(address, "0x1111111111111111111111111111111111111111");
    await user.clear(amount);
    await user.type(amount, "1");

    expect(button).not.toBeDisabled();
    await user.click(button);
    expect(writeContractMock).toHaveBeenCalledTimes(1);
  });
});


