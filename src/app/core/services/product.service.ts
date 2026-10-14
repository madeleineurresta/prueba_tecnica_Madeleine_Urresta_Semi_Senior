import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Product, ProductResponse, ApiResponse } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly baseUrl = 'http://localhost:3002/bp/products';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<ProductResponse>(this.baseUrl).pipe(
      map((res) => res.data),
      catchError(this.handleError)
    );
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<ApiResponse<Product>>(`${this.baseUrl}/${id}`).pipe(
      map((res) => res.data),
      catchError(this.handleError)
    );
  }

  createProduct(product: Product): Observable<ApiResponse<Product>> {
    return this.http
      .post<ApiResponse<Product>>(this.baseUrl, product)
      .pipe(catchError(this.handleError));
  }

  updateProduct(id: string, product: Product): Observable<ApiResponse<Product>> {
    return this.http
      .put<ApiResponse<Product>>(`${this.baseUrl}/${id}`, product)
      .pipe(catchError(this.handleError));
  }

  deleteProduct(id: string): Observable<ApiResponse<void>> {
    return this.http
      .delete<ApiResponse<void>>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  verifyIdExists(id: string): Observable<boolean> {
    return this.http
      .get<boolean>(`${this.baseUrl}/verification/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Error en ProductService:', error);
    return throwError(() => new Error(error.message || 'Error en el servidor'));
  }
}