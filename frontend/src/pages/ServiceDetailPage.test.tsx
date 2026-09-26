import { screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../api/client";
import { getServiceById } from "../api/services";
import { renderWithProviders } from "../test/renderWithProviders";
import { FeesType, type ServiceDetail } from "../types/service.types";
import { ServiceDetailsPage } from "./ServiceDetailPage";

vi.mock("../api/services", () => ({
  getServiceById: vi.fn(),
}));

const mockedGetServiceById = vi.mocked(getServiceById);

const service: ServiceDetail = {
  id: "service-1",
  name: "Senior Pension",
  description: "Monthly financial assistance.",
  eligibility: "Residents aged 60 and above.",
  sourceUrl: "https://example.gov/source",
  officialUrl: "https://example.gov/apply",
  feesType: FeesType.FREE,
  feesText: null,
  processingTime: "30 days",
  jurisdiction: { code: "GUJARAT", name: "Gujarat" },
  requiredDocuments: [
    {
      id: "document-1",
      description: "Identity proof",
      example: "Aadhaar card",
    },
  ],
  steps: [{ id: "step-1", order: 1, text: "Complete the application." }],
};

function renderDetailPage(path = "/services/service-1") {
  return renderWithProviders(
    <Routes>
      <Route path="/services/:id" element={<ServiceDetailsPage />} />
    </Routes>,
    { initialEntries: [path] },
  );
}

describe("ServiceDetailsPage", () => {
  beforeEach(() => {
    mockedGetServiceById.mockReset();
  });

  it("shows loading and then renders service details", async () => {
    let resolveRequest!: (value: ServiceDetail) => void;
    mockedGetServiceById.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );

    renderDetailPage();

    expect(
      screen.getByRole("status", { name: "Loading service details" }),
    ).toBeInTheDocument();

    resolveRequest(service);

    expect(
      await screen.findByRole("heading", { name: "Senior Pension" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Identity proof")).toBeInTheDocument();
    expect(screen.getByText("Complete the application.")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /open official portal/i }),
    ).toHaveAttribute("href", "https://example.gov/apply");
  });

  it("renders a not-found state without retrying a 404", async () => {
    mockedGetServiceById.mockRejectedValue(
      new ApiError("API request failed", 404),
    );

    renderDetailPage();

    expect(
      await screen.findByRole("heading", {
        name: "We could not find this service",
      }),
    ).toBeInTheDocument();
    expect(mockedGetServiceById).toHaveBeenCalledTimes(1);
  });

  it("retries a temporary error once and shows a generic failure", async () => {
    mockedGetServiceById.mockRejectedValue(new Error("connection failed"));

    renderDetailPage();

    expect(
      await screen.findByRole("heading", {
        name: "We could not load the service",
      }),
    ).toBeInTheDocument();
    expect(mockedGetServiceById).toHaveBeenCalledTimes(2);
    expect(screen.queryByText("connection failed")).not.toBeInTheDocument();
  });

  it("does not request data when the route ID is missing", async () => {
    renderWithProviders(<ServiceDetailsPage />, {
      initialEntries: ["/services"],
    });

    expect(
      screen.getByRole("heading", {
        name: "This service link is incomplete",
      }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(mockedGetServiceById).not.toHaveBeenCalled();
    });
  });
});
