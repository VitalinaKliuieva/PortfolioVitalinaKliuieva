import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContactRequest, Portfolio } from './models';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private http = inject(HttpClient);

  load() { return this.http.get<Portfolio>('/api/portfolio'); }
  sendMessage(body: ContactRequest) { return this.http.post<void>('/api/contact', body); }
}
