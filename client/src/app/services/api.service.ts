import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  public readonly baseUrl =
    typeof window !== 'undefined' &&
    (window.location.port !== '4200' ||
      (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'))
      ? '/api'
      : 'http://localhost:5000/api';

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const token = localStorage.getItem('goatfit_token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, {
      headers: this.getHeaders(),
      params: httpParams,
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  patch<T>(endpoint: string, body?: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, body || {}, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    if (error.error instanceof ErrorEvent) {
      // Client-side network error
      errorMessage = error.error.message;
    } else if (error.error && error.error.message) {
      // Server returned JSON error message
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'Could not connect to the backend server. Please verify the Express API is running on http://localhost:5000.';
    }
    return throwError(() => new Error(errorMessage));
  }
}
