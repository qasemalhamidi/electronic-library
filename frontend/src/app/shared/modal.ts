import { Component, ElementRef, input, viewChild } from '@angular/core';

/** غلاف حول عنصر <dialog> الأصلي: ‏open() / close() */
@Component({
  selector: 'app-modal',
  template: `
    <dialog #dlg class="dialog">
      <h2 class="mb-4 text-brand">{{ title() }}</h2>
      <ng-content />
    </dialog>
  `,
})
export class Modal {
  readonly title = input.required<string>();
  private readonly dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  open(): void {
    this.dlg().nativeElement.showModal();
  }

  close(): void {
    this.dlg().nativeElement.close();
  }
}
