import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface CachedRates {
  timestamp: number;
  rates: { [key: string]: number };
}

interface ExchangeRatesResponse {
  rates: { [key: string]: number };
  base: string;
  date: string;
}

type ExchangeRates = { [key: string]: number };

@Injectable({
  providedIn: 'root'
})
export class CurrencyExchangeService {
  private apiKey = environment.openExchangeRatesApiKey;
  private baseUrl = environment.openExchangeRatesApiUrl;
  private ratesSubject = new BehaviorSubject<ExchangeRates | null>(null);
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly CACHE_KEY = 'cached_exchange_rates';

  // Supported currencies
  readonly supportedCurrencies = ['USD', 'EUR', 'EGP', 'AED', 'SAR'];

  constructor(private http: HttpClient) {
    // Load cached rates on service initialization
    const cachedRates = this.getCachedRates();
    if (cachedRates) {
      this.ratesSubject.next(cachedRates.rates);
    }
  }

  // Fetch exchange rates from the API
  private fetchExchangeRates(): Observable<ExchangeRates> {
    const now = Date.now();
    
    // Check if we have a valid cached response
    const cachedRates = this.getCachedRates();
    if (cachedRates && now - cachedRates.timestamp < this.CACHE_DURATION) {
      this.ratesSubject.next(cachedRates.rates);
      return of(cachedRates.rates);
    }

    const url = `${this.baseUrl}?app_id=${this.apiKey}&base=USD&symbols=${this.supportedCurrencies.join(',')}`;
    
    return this.http.get<ExchangeRatesResponse>(url).pipe(
      map(response => {
        if (response && response.rates) {
          this.lastFetchTime = now;
          const rates: ExchangeRates = {};
          // Filter rates to only include supported currencies
          this.supportedCurrencies.forEach(currency => {
            rates[currency] = response.rates[currency] || 0;
          });
          this.ratesSubject.next(rates);
          this.saveRatesToStorage(rates);
          return rates;
        }
        throw new Error('Invalid response from exchange rate API');
      }),
      catchError(error => {
        console.error('Error fetching exchange rates:', error);
        // If we have cached rates, use them as fallback
        if (cachedRates) {
          this.ratesSubject.next(cachedRates.rates);
          return of(cachedRates.rates);
        }
        // If no cached rates available, return default rates (1:1)
        const defaultRates: ExchangeRates = {};
        this.supportedCurrencies.forEach(currency => {
          defaultRates[currency] = 1;
        });
        return of(defaultRates);
      })
    );
  }

  // Get exchange rates for specific currencies
  getExchangeRates(currencies: string[]): Observable<ExchangeRates> {
    // If no currencies provided, return empty object
    if (!currencies || currencies.length === 0) {
      return of({});
    }

    // Check if we have cached rates
    const cachedRates = this.getCachedRates();
    if (cachedRates) {
      const result: ExchangeRates = {};
      currencies.forEach(currency => {
        result[currency] = cachedRates.rates[currency] || 1;
      });
      return of(result);
    }

    // If no cached rates, fetch fresh rates
    return this.fetchExchangeRates().pipe(
      map(rates => {
        const result: ExchangeRates = {};
        currencies.forEach(currency => {
          result[currency] = rates[currency] || 1;
        });
        return result;
      }),
      catchError(error => {
        console.error('Error fetching exchange rates:', error);
        // Return default rates in case of error
        const defaultRates: ExchangeRates = {};
        currencies.forEach(currency => {
          defaultRates[currency] = 1;
        });
        return of(defaultRates);
      })
    );
  }

  // Convert amount from one currency to another
  convert(amount: number, fromCurrency: string, toCurrency: string): Observable<number> {
    // If same currency, no conversion needed
    if (fromCurrency === toCurrency) {
      return of(amount);
    }

    // Check if we have cached rates
    const cachedRates = this.getCachedRates();
    if (cachedRates) {
      const fromRate = cachedRates.rates[fromCurrency] || 1;
      const toRate = cachedRates.rates[toCurrency] || 1;
      const convertedAmount = (amount / fromRate) * toRate;
      return of(parseFloat(convertedAmount.toFixed(6)));
    }

    // If no cached rates, fetch fresh rates
    return this.fetchExchangeRates().pipe(
      map(rates => {
        const fromRate = rates[fromCurrency] || 1;
        const toRate = rates[toCurrency] || 1;
        const convertedAmount = (amount / fromRate) * toRate;
        return parseFloat(convertedAmount.toFixed(6));
      })
    );
  }

  // Get all supported currencies
  getSupportedCurrencies(): string[] {
    return [...this.supportedCurrencies];
  }

  // Get cached rates from localStorage
  private getCachedRates(): CachedRates | null {
    try {
      const cachedData = localStorage.getItem(this.CACHE_KEY);
      if (!cachedData) return null;

      const { rates, timestamp } = JSON.parse(cachedData);
      
      // Check if cache is still valid
      if (Date.now() - timestamp < this.CACHE_DURATION) {
        return { rates, timestamp };
      }
    } catch (e) {
      console.error('Error parsing cached rates:', e);
    }
    return null;
  }

  // Save rates to localStorage
  private saveRatesToStorage(rates: ExchangeRates): void {
    try {
      const data = {
        rates,
        timestamp: Date.now()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving rates to storage:', e);
    }
  }
}
