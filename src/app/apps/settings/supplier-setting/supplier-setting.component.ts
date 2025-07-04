import { NgClass, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'src/app/service/auth/auth.service';
import { SupplierService } from 'src/app/service/supplier/supplier.service';
import Swal from 'sweetalert2';

interface ISupplier {
  id: number;
  fullName: string;
  address: string;
  mobile: number;
}

@Component({
  selector: 'app-supplier-setting',
  standalone: true,
  imports: [FormsModule, NgIf, ReactiveFormsModule],
  templateUrl: './supplier-setting.component.html',
  styleUrl: './supplier-setting.component.css'
})
export class SupplierSettingComponent implements OnInit{
    private readonly _FormBuilder = inject(FormBuilder)
    private readonly _AuthService = inject(AuthService)
    private readonly _SupplierService = inject(SupplierService)

    allSuppliers:any[] = []
    supplierId:string = ''
    update:boolean = false

    ngOnInit(): void {
        this.getAllSuppliers()
    }

    getAllSuppliers():void{
        this._SupplierService.getAllSuppliers().subscribe({
            next:(res)=>{
                this.allSuppliers = res.data
                this.filteredSuppliers = [...this.allSuppliers]
            }
        })
    }

    supplierForm:FormGroup = this._FormBuilder.group({
        fullName:[''],
        mobile:[''],
        address:[''],
        roleId: ['cf98e740-9544-426f-a0a8-852255b6a340']
    })

    submitSupplierForm():void{
        let data = this.supplierForm.value
        this._AuthService.register(data).subscribe({
            next:(res)=>{
                Swal.fire({
                    title: "تم إضافة مورد بنجاح",
                    icon: "success",
                })
                this.supplierForm.reset()
                this.supplierForm.get('roleId')?.setValue('cf98e740-9544-426f-a0a8-852255b6a340')
                this.getAllSuppliers()
            }
        })
    }

    deleteSupplier(id:number):void{
        this._SupplierService.deleteSupplier(id).subscribe({
            next:(res)=>{
                Swal.fire({
                    title: "تم حذف المورد بنجاح",
                    icon: "success",
                })
                this.getAllSuppliers()
            }
        })
    }

    patchSupplierData(supplier:any):void{
        this.supplierId = supplier.id
        this.supplierForm.patchValue(supplier)
        this.update = true
    }

    updateSupplier():void{
        let data = this.supplierForm.value
        data.id = this.supplierId

        this._SupplierService.updateSupplier(this.supplierId, data).subscribe({
            next:(res)=>{
                this.update = false
                Swal.fire({
                    title: "تم تعديل المورد بنجاح",
                    icon: "success",
                })
                this.supplierForm.reset()
                this.getAllSuppliers()
            }
        })
    }

    filteredSuppliers: ISupplier[] = [...this.allSuppliers];
    searchTerm: string = '';
    sortColumn: keyof ISupplier = 'fullName';
    sortDirection: 'asc' | 'desc' = 'asc';

    filterSuppliers() {
        const term = this.searchTerm.trim().toLowerCase();

        this.filteredSuppliers = this.allSuppliers.filter(supplier => {
            return (
                supplier.fullName.toLowerCase().includes(term) ||
                supplier.address.toString().includes(term) ||
                supplier.mobile.toString().includes(term)
            );
        });

        this.sort();
    }
    sortBy(column: keyof ISupplier) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
        this.sort();
    }

    sort() {
        this.filteredSuppliers.sort((a, b) => {
            const valueA = a[this.sortColumn];
            const valueB = b[this.sortColumn];

            if (typeof valueA === 'string' && typeof valueB === 'string') {
            return this.sortDirection === 'asc'
                ? valueA.localeCompare(valueB)
                : valueB.localeCompare(valueA);
            }

            if (typeof valueA === 'number' && typeof valueB === 'number') {
            return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
            }

            return 0;
        });
    }
}
