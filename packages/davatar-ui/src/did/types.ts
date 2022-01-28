import type { IKey } from "../keys";

/**
 * Identifier interface
 * @public
 */
export interface IIdentifier {
  /**
   * Decentralized identifier
   */
  did: string;

  /**
   * Optional. Identifier alias. Can be used to reference an object in an external system
   */
  alias?: string;

  /**
   * Controller key id
   */
  controllerKeyId?: string;

  /**
   * Array of managed keys
   */
  keys: IKey[];

  /**
   * Array of services
   */
  services: IService[];
}

/**
 * Identifier service
 * @public
 */
export interface IService {
  /**
   * ID
   */
  id: string;

  /**
   * Service type
   */
  type: string;

  /**
   * Endpoint URL
   */
  serviceEndpoint: string;

  /**
   * Optional. Description
   */
  description?: string;
}
