import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { dateReleaseValidator, dateRevisionValidator } from '../../../shared/validators/custom-validators';
import { ProductService } from '../../../core/services/product.service';


@Component({
  selector: 'app-product-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm implements OnInit {
  productForm!: FormGroup;
  isEditMode = false;
  productId: string | null = null;
  errorMessage = '';
  successMessage = '';
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.productId = id;
        this.loadProduct(id);
      }
    });
  }

  private buildForm(): void {
    this.productForm = this.fb.group(
      {
        id: [
          '',
          [Validators.required, Validators.minLength(3), Validators.maxLength(10)],
          [this.idExistsValidator.bind(this)],
        ],
        name: [
          '',
          [Validators.required, Validators.minLength(5), Validators.maxLength(100)],
        ],
        description: [
          '',
          [Validators.required, Validators.minLength(10), Validators.maxLength(200)],
        ],
        logo: ['', Validators.required],
        date_release: ['', [Validators.required, dateReleaseValidator()]],
        date_revision: ['', Validators.required],
      },
      { validators: dateRevisionValidator() }
    );
  }

  private idExistsValidator(control: AbstractControl): Observable<ValidationErrors | null> {
  if (!control.value || control.value.length < 3) {
    return of(null);
  }
  if (this.isEditMode) {
    return of(null);
  }
  return timer(300).pipe(
    switchMap(() => this.productService.verifyIdExists(control.value)),
    map((exists: boolean): ValidationErrors | null =>
      exists ? { idExists: true } : null
    ),
    catchError(() => of(null))
  );
}

  private loadProduct(id: string): void {
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.productForm.patchValue(product);
        this.productForm.get('id')?.disable();
      },
      error: () => {
        this.errorMessage = 'Error al cargar el producto.';
      },
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formValue = this.productForm.getRawValue();

    if (this.isEditMode && this.productId) {
      this.productService.updateProduct(this.productId, formValue).subscribe({
        next: () => {
          this.successMessage = 'Producto actualizado correctamente.';
          setTimeout(() => this.router.navigate(['/products']), 1200);
        },
        error: () => {
          this.errorMessage = 'Error al actualizar el producto.';
        },
      });
    } else {
      this.productService.createProduct(formValue).subscribe({
        next: () => {
          this.successMessage = 'Producto creado correctamente.';
          setTimeout(() => this.router.navigate(['/products']), 1200);
        },
        error: () => {
          this.errorMessage = 'Error al crear el producto.';
        },
      });
    }
  }

  onReset(): void {
    this.submitted = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.productForm.reset();

    if (this.isEditMode && this.productId) {
      this.loadProduct(this.productId);
    }
  }

  get f() {
    return this.productForm.controls;
  }

  get dateRevisionError(): boolean {
    return (
      this.productForm.hasError('dateRevisionInvalid') &&
      (this.f['date_revision'].touched || this.submitted)
    );
  }
}