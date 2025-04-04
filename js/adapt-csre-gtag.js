import Adapt from 'core/js/adapt';

class AdaptGtag extends Backbone.Controller {
  initialize() {
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

  onInitialize() {
    if (!this.config?._isEnabled) return;

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

    const tracking = {
      courseTitle: Adapt.course.get('title'),
      status: completionData.status?.asLowerCase || 'unknown'
    };

    this.sendEvent('tracking:complete', tracking);
  }

  onQuestionRecordInteraction(questionView) {
    if (!this.config?._isEnabled) return;

    const responseType = questionView.getResponseType();
    if (_.isEmpty(responseType)) return;

    const interaction = {
      courseTitle: Adapt.course.get('title'),
      id: questionView.model.get('_id'),
      title: questionView.model.get('title'),
      response: questionView.getResponse(),
      result: questionView.isCorrect()
    };

    this.sendEvent('questionView:recordInteraction', interaction);
  }
}

export default new AdaptGtag();