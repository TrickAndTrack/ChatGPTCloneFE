import { Component, signal } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 


type Message = { sender: 'user' | 'bot'; text: string };

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  userInput = '';
  messages = signal<Message[]>([]);
  isLoading = signal(false);

  constructor(private http: HttpClient) {}

  sendMessage() {
    const text = this.userInput.trim();
    if (!text) return;

    const userMsg: Message = { sender: 'user', text };
    this.messages.update(msgs => [...msgs, userMsg]);

    const payload = new FormData();
    payload.append('text', text);

    this.isLoading.set(true);

    this.http.post('http://localhost:8082/api/generate-content', payload).subscribe({
      next: (response: any) => {
        const botText =
          response?.candidates?.[0]?.content?.parts?.[0]?.text ||
          'Invalid response from API.';

        const botMsg: Message = { sender: 'bot', text: botText };
        this.messages.update(msgs => [...msgs, botMsg]);
      },
      error: () => {
        const errorMsg: Message = { sender: 'bot', text: 'Something went wrong.' };
        this.messages.update(msgs => [...msgs, errorMsg]);
      },
      complete: () => {
        this.userInput = '';
        this.isLoading.set(false);
      },
    });
  }

  // ✅ Add this method to format line breaks
  formatText(text: string): string {
    return text.replace(/\n/g, '<br>');
  }
}
