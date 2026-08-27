/** Exposes process metrics independently from the HTTP implementation. */
export abstract class MetricsExpositionPort {
  abstract readonly contentType: string;
  abstract render(): Promise<string>;
}
