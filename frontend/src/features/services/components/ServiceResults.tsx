import { Link } from "react-router-dom";
import type { ServiceListItem } from "../../../types/service.types";

export type ServiceResultsProps = {
  serviceList: ServiceListItem[];
};

export function ServiceResults({ serviceList }: ServiceResultsProps) {
  return serviceList.length > 0 ? (
    <ul>
      {serviceList.map((service) => (
        <li key={service.id}>
          <Link to={"/services/" + service.id}>
            {service.name + " Jurisdiction: " + service.jurisdiction.name}
          </Link>
        </li>
      ))}
    </ul>
  ) : (
    <p>No Services found</p>
  );
}
