import Adapt from 'core/js/adapt';

// GA4 cuts event parameter values off at 100 characters
const MAX_PARAM_LENGTH = 100;

class AdaptGtag extends Backbone.Controller {
  initialize() {
    this.isInitialized = false;
    Adapt.once('app:dataReady', this.onDataReady.bind(this));
  }

  onDataReady() {
    this.config = Adapt.config.get('_gtag');
    if (!this.config || !this.config._isEnabled) return;

    if (this.config._injectSnippets !== false) {
      $('head').append(Handlebars.templates.gtag(this.config));
      $('body').append(Handlebars.templates.gtagbody(this.config));
    }

    // Register core tracking events
    Adapt.on({
      'questionView:recordInteraction': this.onQuestionRecordInteraction.bind(this),
      'tracking:complete': this.onTrackingComplete.bind(this),
      'assessment:complete': this.onAssessmentComplete.bind(this),
      'adapt:initialize': this.onInitialize.bind(this)
    });
  }

  sendEvent(eventName, eventParams) {
    if (!window.dataLayer) return;
    const eventData = {
      event: eventName,
      ...eventParams
    };
    if (this.config._debug) console.log('[AdaptGtag]', eventData);
    window.dataLayer.push(eventData);
  }

  // Plain text, cut to GA4's parameter length limit
  toParam(value) {
    if (value === undefined || value === null) return '';
    const text = $('<div>').html(String(value)).text().replace(/\s+/g, ' ').trim();
    return text.length > MAX_PARAM_LENGTH ? text.slice(0, MAX_PARAM_LENGTH - 1) + '…' : text;
  }

  onInitialize() {
    if (!this.config?._isEnabled) return;

    // Events before this point come from Spoor restoring the learner's
    // saved progress, not from anything the learner just did.
    this.isInitialized = true;

    const globals = Adapt.course.get('_globals') || {};
    const learnerId = globals._learnerInfo?.id || 'unknown';

    const details = {
      courseTitle: Adapt.course.get('title'),
      studentId: learnerId
    };

    this.sendEvent('courseLoaded', details);
  }

  onTrackingComplete(completionData) {
    if (!this.config?._isEnabled) return;
    // Reopening a finished module restores its completion before the
    // course starts; only count completions made in this session.
    if (!this.isInitialized) return;

    // `title` is kept alongside `courseTitle` because 1.0.x sent it under
    // that name and existing GTM variables read it.
    const tracking = {
      courseTitle: Adapt.course.get('title'),
      title: Adapt.course.get('title'),
      status: completionData.status?.asLowerCase || 'unknown'
    };

    this.sendEvent('tracking:complete', tracking);
  }

  onAssessmentComplete(state) {
    if (!this.config?._isEnabled) return;
    if (!this.isInitialized || !state) return;

    const result = {
      courseTitle: Adapt.course.get('title'),
      isPass: Boolean(state.isPass ?? state.isPassed),
      score: state.score,
      maxScore: state.maxScore,
      scoreAsPercent: state.scoreAsPercent,
      correctCount: state.correctCount,
      questionCount: state.questionCount,
      correctAsPercent: state.correctAsPercent
    };

    this.sendEvent('assessment:complete', result);
  }

  // The learner's answer as readable text: the chosen option(s) for
  // multiple choice, "item number: option" pairs for matching (item text
  // is often a long scenario that would use up the 100 characters),
  // otherwise the raw response.
  getResponseText(questionView) {
    const model = questionView.model;
    try {
      if (typeof model.getActiveItemOption === 'function' && model.get('_items')) {
        return model.get('_items').map(({ _index }) => {
          const option = model.getActiveItemOption(_index);
          return `${_index + 1}: ${option ? this.toParam(option.get('text')) : ''}`;
        }).join(' | ');
      }
      if (typeof model.getActiveItems === 'function') {
        return model.getActiveItems().map(item => this.toParam(item.get('text'))).join(' | ');
      }
    } catch (err) {
      if (this.config._debug) console.warn('[AdaptGtag] could not read response text', err);
    }
    return questionView.getResponse();
  }

  onQuestionRecordInteraction(questionView) {
    if (!this.config?._isEnabled) return;

    const responseType = questionView.getResponseType();
    if (_.isEmpty(responseType)) return;

    const interaction = {
      courseTitle: Adapt.course.get('title'),
      id: questionView.model.get('_id'),
      title: this.toParam(questionView.model.get('title')),
      response: questionView.getResponse(),
      responseText: this.toParam(this.getResponseText(questionView)),
      result: questionView.isCorrect(),
      responseType
    };

    this.sendEvent('questionView:recordInteraction', interaction);
  }
}

export default new AdaptGtag();
