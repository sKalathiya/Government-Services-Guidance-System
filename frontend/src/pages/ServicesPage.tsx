import { useEffect, useState } from "react";
import type { ServiceListItem } from "../types/service.types";
import { getServiceList } from "../api/services";

export function ServicesPage() {
  const [searchText, setSearchText] = useState<string>("");
  const [jurisdiction, setJurisdiction] = useState<string>("");
  const [serviceList, setServiceList] = useState<ServiceListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    setError(null);
    setIsLoading(true);
    const getData = async () => {
      try {
        if (!abortController.signal.aborted) {
          const data = await getServiceList({}, abortController.signal);
          setServiceList(data);
        }
      } catch {
        if (!abortController.signal.aborted)
          setError("Failed to fetch services!");
      } finally {
        if (!abortController.signal.aborted) setIsLoading(false);
      }
    };
    getData();
    return () => abortController.abort();
  }, []);

  async function handleFormSubmit(
    e: React.SubmitEvent<HTMLFormElement>,
  ): Promise<void> {
    e.preventDefault();
    if (isLoading) return;
    setError(null);
    setIsLoading(true);
    try {
      const data = await getServiceList({
        q: searchText,
        jurisdiction: jurisdiction,
      });
      setServiceList(data);
    } catch {
      setError("Unable to fetch services!");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <h1>Services</h1>
      {error && <p role="alert">{error}</p>}

      <form onSubmit={handleFormSubmit}>
        <label htmlFor="searchText"> Search Service Name </label>
        <input
          type="text"
          id="searchText"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <label htmlFor="jurisdiction">Search Jurisdiction</label>
        <select
          value={jurisdiction}
          id="jurisdiction"
          onChange={(e) => setJurisdiction(e.target.value)}
        >
          <option value="">Select Jurisdiction</option>
          <option value="GUJARAT">Gujarat</option>
          <option value="CENTRAL">Central</option>
        </select>

        <button type="submit" disabled={isLoading}>
          Search
        </button>
        {isLoading && <p aria-live="polite">loading</p>}
      </form>

      {!isLoading && !error && serviceList.length > 0 && (
        <ul>
          {serviceList.map((service) => (
            <li key={service.id}>
              {service.name + " Jurisdiction: " + service.jurisdiction.name}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
