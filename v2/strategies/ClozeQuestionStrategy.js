class ClozeQuestionStrategy {
    type() {
        return StrategyType.CLOZE_QUESTION;
    }

    execute(vm) {
        if (vm.__descoClozeStrategyInstalled) return;

        console.log("[Extension] 'CLOZE QUESTION' strategy activated!");
        vm.__descoClozeStrategyInstalled = true;

        const selectCorrectAnswer = () => {
            if (vm.locked || vm.replyState === 'correct') return;

            const alternatives = vm.question && vm.question.alternatives;
            const correctAlternative = Array.isArray(alternatives)
                ? alternatives.find(alternative => alternative.correct)
                : null;

            if (!correctAlternative || typeof vm.changeSelected !== 'function') return;

            // ClozeQuestion.changeSelected emits (questionId, alternativeId).
            // Calling it updates ObjectivePractice.selectedOptions, which is
            // the state used by the parent to enable the submit button.
            vm.changeSelected(correctAlternative.id);

            const highlight = () => {
                if (vm.$el) vm.$el.classList.add('question__alternative--correct-animated');
            };
            if (typeof vm.$nextTick === 'function') vm.$nextTick(highlight);
            else highlight();
        };

        selectCorrectAnswer();

        // The activity enters Edit mode after the user clicks its Edit button.
        // Reapply then, since the question components can already be mounted
        // while their selects are locked in the viewing state.
        if (typeof vm.$watch === 'function') {
            vm.$watch('locked', selectCorrectAnswer);
            vm.$watch('replyState', selectCorrectAnswer);
        }
    }
}
