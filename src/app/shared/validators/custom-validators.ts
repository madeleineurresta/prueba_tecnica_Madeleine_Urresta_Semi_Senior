import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dateReleaseValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const [year, month, day] = control.value.split('-').map(Number);
    const releaseDate = new Date(year, month - 1, day);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    releaseDate.setHours(0, 0, 0, 0);

    return releaseDate.getTime() >= today.getTime()
      ? null
      : { dateReleaseInvalid: true };
  };
}

export function dateRevisionValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const release = group.get('date_release')?.value;
    const revision = group.get('date_revision')?.value;
    if (!release || !revision) return null;

    const [ry, rm, rd] = release.split('-').map(Number);
    const [vy, vm, vd] = revision.split('-').map(Number);

    const releaseDate = new Date(ry, rm - 1, rd);
    const revisionDate = new Date(vy, vm - 1, vd);

    const expected = new Date(releaseDate);
    expected.setFullYear(expected.getFullYear() + 1);

    const isSameDate =
      revisionDate.getFullYear() === expected.getFullYear() &&
      revisionDate.getMonth() === expected.getMonth() &&
      revisionDate.getDate() === expected.getDate();

    return isSameDate ? null : { dateRevisionInvalid: true };
  };
}