import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormArray, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { states, Hero, Address } from './../data-model';
import { HeroService } from '../hero.service';

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.css']
})
export class HeroDetailComponent implements OnInit, OnChanges {
  @Input() hero = new Hero();
  heroForm: FormGroup;
  states = states;
  nameChangeLog: string[] = [];

  // Appelé dès qu'il y a une changement dans le Input
  ngOnChanges(): void {
    // Le input du hero est mis à jour
    this.rebuildForm();
  }

  rebuildForm() {
    this.heroForm.reset({
      name: this.hero.name
      // address: this.hero.addresses[0] || new Address()
    });
    this.setAddresses(this.hero.addresses);
  }

  constructor(private fb: FormBuilder, private heroService: HeroService) {
    this.createForm();
    this.logNameChange();
  }

  createForm() {
    // this.heroForm = this.fb.group({
    //   name: ['', Validators.required],
    //   address: this.fb.group(new Address()),
    //   power: '',
    //   sidekick: ''
    // });

    this.heroForm = this.fb.group({
      name: ['', Validators.required],
      secretLairs: this.fb.array([]),
      power: '',
      sidekick: ''
    });

    // setter toutes des valeurs avec des vérification (erreur si valuer non présente ou en trop)
    // this.heroForm.setValue({
    //   name: this.hero.name,
    //   address: this.hero.addresses[0] || new Address()
    // });

    // setter des valeurs avec moins de controles
    this.heroForm.patchValue({
      name: this.hero.name
    });
  }

  logNameChange() {
    const nameControl = this.heroForm.get('name');
    nameControl.valueChanges.forEach((value: string) =>
      this.nameChangeLog.push(value)
    );
  }

  setAddresses(addresses: Address[]) {
    const addressFGs = addresses.map(address => this.fb.group(address));
    const addressFormArray = this.fb.array(addressFGs);
    // ici on change le controle, pas sa valeur
    this.heroForm.setControl('secretLairs', addressFormArray);
  }

  get secretLairs(): FormArray {
    return this.heroForm.get('secretLairs') as FormArray;
  }

  addLair() {
    this.secretLairs.push(this.fb.group(new Address()));
  }

  removeLair(index: number) {
    this.secretLairs.removeAt(index);
  }

  onSubmit() {
    this.hero = this.prepareSaveHero();
    this.heroService.updateHero(this.hero).subscribe(/* error handling */);
    this.rebuildForm();
  }

  prepareSaveHero(): Hero {
    const formModel = this.heroForm.value;

    // deep copy of form model lairs
    const secretLairsDeepCopy: Address[] = formModel.secretLairs.map(
      (address: Address) => Object.assign({}, address)
    );

    // return new `Hero` object containing a combination of original hero value(s)
    // and deep copies of changed form model values
    const saveHero: Hero = {
      id: this.hero.id,
      name: formModel.name as string,
      // addresses: formModel.secretLairs // <-- bad!
      addresses: secretLairsDeepCopy
    };
    return saveHero;
  }

  revert() {
    this.rebuildForm();
  }

  ngOnInit() {}
}
