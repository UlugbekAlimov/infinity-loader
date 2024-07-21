import { DialogModule } from 'primeng/dialog';
import { Component , OnInit , HostListener  } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule , FormGroup , ReactiveFormsModule , FormBuilder , Validators} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from './interface/user.interface';
import { DataService } from './service/data.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet , CommonModule ,ReactiveFormsModule, FormsModule , DialogModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [MessageService] 

})
export class AppComponent implements OnInit {
  users: User[] = [];
  isLoading: boolean = false;
  hasMore: boolean = true;
  pageSize: number = 5;
  displayModal: boolean = false;
  userForm: FormGroup;


  constructor(
    private dataService: DataService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required],
      amount: [0, Validators.required],
      status: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    if (this.isLoading || !this.hasMore) return;

    this.isLoading = true;
    this.dataService.getUsers().subscribe(
      (data: User[]) => {
        this.users = [...this.users, ...data];
        this.isLoading = false;
        if (data.length === 0) {
          this.hasMore = false;
        }
      },
      error => {
        console.error('Ошибка при загрузке данных:', error);
        this.isLoading = false;
      }
    );
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;

    if (scrollHeight - scrollTop <= clientHeight + 50 && this.hasMore && !this.isLoading) {
      this.loadUsers();
    }
  }
  
  showModal(): void {
    this.displayModal = true;
  }

  addUser(): void {
    if (this.userForm.valid) {
      this.dataService.createUser(this.userForm.value).subscribe(
        (newUser: User) => {
          this.users = [...this.users, newUser];
          this.displayModal = false;
          this.userForm.reset();
          this.messageService.add({severity: 'success', summary: 'Success', detail: 'User added successfully'});
        },
        error => {
          console.error('Error while adding user:', error);
          this.messageService.add({severity: 'error', summary: 'Error', detail: 'Failed to add user'});
        }
      );
    }
  }

} 