// Exchange rates for the price comparisons, read once per request.
import { cache } from 'react';
import { ambilKurs } from './kurs';
import type { Kurs } from './uang';

export const kursAktif = cache(async (): Promise<Kurs> => (await ambilKurs()).idrPer);
