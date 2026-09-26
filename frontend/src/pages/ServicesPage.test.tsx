import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocation } from "react-router-dom";
import { getServiceList } from "../api/services";
import { renderWithProviders } from "../test/renderWithProviders";
import type { ServiceListItem } from "../types/service.types";
import { ServicesPage } from "./ServicesPage";

vi.mock("../api/services", () => ({
  getServiceList: vi.fn(),
}));

const mockedGetServiceList = vi.mocked(getServiceList);

const services: ServiceListItem[] = [
  {
    id: "service-1",
    name: "Senior Pension",
    jurisdiction: { code: "GUJARAT", name: "Gujarat" },
  },
];

function LocationSearch() {
  return <output aria-label="location-search">{useLocation().search}</output>;
}

describe("ServicesPage", () => {
  beforeEach(() => {
    mockedGetServiceList.mockReset();
  });

  it("shows loading and then renders service results", async () => {
    let resolveRequest!: (value: ServiceListItem[]) => void;
    mockedGetServiceList.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );

    renderWithProviders(<ServicesPage />, {
      initialEntries: ["/services"],
    });

    expect(
      screen.getByRole("status", { name: "Loading services" }),
    ).toBeInTheDocument();

    resolveRequest(services);

    expect(
      await screen.findByRole("link", { name: /senior pension/i }),
    ).toHaveAttribute("href", "/services/service-1");
  });

  it("renders a successful empty state", async () => {
    mockedGetServiceList.mockResolvedValue([]);

    renderWithProviders(<ServicesPage />, {
      initialEntries: ["/services"],
    });

    expect(
      await screen.findByRole("heading", { name: "No services found" }),
    ).toBeInTheDocument();
  });

  it("restores normalized filters from the URL", async () => {
    mockedGetServiceList.mockResolvedValue([]);

    renderWithProviders(<ServicesPage />, {
      initialEntries: [
        "/services?q=%20Senior%20Pension%20&jurisdiction=gujarat",
      ],
    });

    expect(
      screen.getByRole("searchbox", { name: /service name/i }),
    ).toHaveValue("Senior Pension");
    expect(screen.getByRole("combobox", { name: /jurisdiction/i })).toHaveValue(
      "GUJARAT",
    );

    await waitFor(() => {
      expect(mockedGetServiceList).toHaveBeenCalledWith(
        { q: "Senior Pension", jurisdiction: "GUJARAT" },
        expect.any(AbortSignal),
      );
    });
  });

  it("submits normalized filters into the URL", async () => {
    mockedGetServiceList.mockResolvedValue([]);
    const user = userEvent.setup();

    renderWithProviders(
      <>
        <ServicesPage />
        <LocationSearch />
      </>,
      { initialEntries: ["/services"] },
    );

    await screen.findByRole("heading", { name: "No services found" });

    await user.type(
      screen.getByRole("searchbox", { name: /service name/i }),
      "  Pension  ",
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: /jurisdiction/i }),
      "GUJARAT",
    );
    await user.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => {
      expect(screen.getByLabelText("location-search")).toHaveTextContent(
        "?q=Pension&jurisdiction=GUJARAT",
      );
    });
  });

  it("renders a generic error without exposing server details", async () => {
    mockedGetServiceList.mockRejectedValue(new Error("sensitive server error"));

    renderWithProviders(<ServicesPage />, {
      initialEntries: ["/services"],
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to fetch services!",
    );
    expect(
      screen.queryByText("sensitive server error"),
    ).not.toBeInTheDocument();
  });
});
