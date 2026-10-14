import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { Modal } from '../../../shared/components/modal/modal';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule, Modal],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm = '';
  pageSize = 5;
  pageSizes = [5, 10, 20];
  showModal = false;
  productToDelete: Product | null = null;
  loading = false;
  errorMessage = '';
  openMenuId: string | null = null;

  constructor(
    private productService: ProductService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Error al cargar los productos. Intenta de nuevo.';
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.applyFilter();
  }

  onPageSizeChange(): void {
    this.applyFilter();
  }

  private applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    const filtered = term
      ? this.products.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term)
        )
      : [...this.products];
    this.filteredProducts = filtered.slice(0, this.pageSize);
  }

  toggleMenu(id: string): void {
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  goToAdd(): void {
    this.router.navigate(['/products/add']);
  }

  goToEdit(id: string): void {
    this.openMenuId = null;
    this.router.navigate(['/products/edit', id]);
  }

  openDeleteModal(product: Product): void {
    this.productToDelete = product;
    this.showModal = true;
    this.openMenuId = null;
  }

  cancelDelete(): void {
    this.showModal = false;
    this.productToDelete = null;
  }

  confirmDelete(): void {
    if (!this.productToDelete) return;
    const id = this.productToDelete.id;
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.products = this.products.filter((p) => p.id !== id);
        this.applyFilter();
        this.showModal = false;
        this.productToDelete = null;
      },
      error: () => {
        this.errorMessage = 'Error al eliminar el producto.';
        this.showModal = false;
        this.productToDelete = null;
      },
      
    });
  }

  trackById(index: number, item: Product): string {
  return item.id;
}
}