import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface ExchangeRatesResponse {
  rates: { [key: string]: number };
  base: string;
  date: string;
}

type ExchangeRates = { [key: string]: number };

interface CachedRates {
  timestamp: number;
  rates: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyExchangeService {
  private apiKey = environment.openExchangeRatesApiKey;
  private baseUrl = environment.openExchangeRatesApiUrl;
  private readonly CACHE_KEY = 'cached_exchange_rates';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  readonly supportedCurrencies = ['USD', 'EUR', 'EGP', 'AED', 'SAR'];

  constructor(private http: HttpClient) { }

  private fetchExchangeRates(): Observable<ExchangeRates> {
    const url = `${this.baseUrl}?app_id=${this.apiKey}&base=USD&symbols=${this.supportedCurrencies.join(',')}`;
    return this.http.get<ExchangeRatesResponse>(url).pipe(
      map(response => {
        if (response && response.rates) {
          const rates: ExchangeRates = {};
          this.supportedCurrencies.forEach(currency => {
            rates[currency] = response.rates[currency] || 0;
          });
          this.saveRatesToStorage(rates);
          return rates;
        }
        throw new Error('Invalid response from exchange rate API');
      }),
      catchError(error => {
        console.error('Error fetching exchange rates:', error);
        const defaultRates: ExchangeRates = {};
        this.supportedCurrencies.forEach(currency => {
          defaultRates[currency] = 1;
        });
        return of(defaultRates);
      })
    );
  }

  getExchangeRate(fromCurrency: string, toCurrency: string): Observable<number> {
    if (fromCurrency === toCurrency) {
      return of(1);
    }

    const cachedRates = this.getCachedRates();
    if (cachedRates) {
      const fromRate = cachedRates.rates[fromCurrency] || 1;
      const toRate = cachedRates.rates[toCurrency] || 1;
      return of(toRate / fromRate);
    }

    return this.fetchExchangeRates().pipe(
      map(rates => {
        const fromRate = rates[fromCurrency] || 1;
        const toRate = rates[toCurrency] || 1;
        return toRate / fromRate;
      })
    );
  }

  getSupportedCurrencies(): string[] {
    return [...this.supportedCurrencies];
  }

  private getCachedRates(): CachedRates | null {
    try {
      const cachedData = localStorage.getItem(this.CACHE_KEY);
      if (!cachedData) {
        return null;
      }
      const { rates, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < this.CACHE_DURATION) {
        return { rates, timestamp };
      }
      return null;
    } catch (e) {
      console.error('Error reading cached rates:', e);
      return null;
    }
  }

  private saveRatesToStorage(rates: ExchangeRates) {
    try {
      const dataToCache: CachedRates = {
        rates,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(dataToCache));
    } catch (e) {
      console.error('Error saving rates to storage:', e);
    }
  }
}