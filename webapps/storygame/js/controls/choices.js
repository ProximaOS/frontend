const Choices = {
  choices: [
    {
      text: 'Option A',
      effect: function() {
        // code to be executed when this choice is selected
      }
    },
    {
      text: 'Option B',
      effect: function() {
        // code to be executed when this choice is selected
      }
    },
    {
      text: 'Option C',
      effect: function() {
        // code to be executed when this choice is selected
      }
    }
  ],

  showChoices: function() {
    // code to display the available choices to the player
    for (let i = 0; i < this.choices.length; i++) {
      console.log(`${i+1}. ${this.choices[i].text}`);
    }
  },

  selectChoice: function(choiceIndex) {
    // execute the effect of the selected choice
    if (choiceIndex >= 0 && choiceIndex < this.choices.length) {
      this.choices[choiceIndex].effect();
    }
  },

  update: function() {
    requestAnimationFrame(update);

    var currentCharacter =
      Characters.characters[Characters.currentCharacterIndex];
  }
};

Choices.update();
