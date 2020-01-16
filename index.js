/*!
 * Calvin 1.0.0
 * Copyright 2020 Who's Who in Luxury Real Estate
 * https://github.com/luxre/calvin
 */
var defaultCalvinOptions = {
  linkTypes: ['icalendar', 'google', 'outlook', 'outlookcom', 'yahoo'],
  parentClass: 'calvin',
  bootstrapButtonColor: 'primary',
  buttonContent: 'Add To Calendar',
  includeIcons: true
};

var calvin = {

  init: function(options) {

    if (options) {
      for (var prop in options) {
        defaultCalvinOptions[prop] = options[prop];
      }
    }
    options = defaultCalvinOptions;
    calvin.addLinksDropdown(options);
    if (options.includeIcons) {
      calvin.linkStyles(options.linkTypes);
    }

  },

  addLinksDropdown: function(options) {
    var parentElements = document.getElementsByClassName(options.parentClass);
    [].forEach.call(parentElements, function(el) {
      var eventObj = {
        title: el.dataset.title,
        description: el.dataset.description || '',
        location: el.dataset.location,
        start: el.dataset.start,
        end: el.dataset.end,
        filename: el.dataset.filename || 'event',
        timezone: el.dataset.timezone || ''
      };

      var html;
      if (options.linkTypes.length == 1) {
        html = calvin.addLink(options.linkTypes[0], eventObj, options, true);
      } else {

        html = '<div class="dropdown">';
        html += '<a class="btn btn-' + options.bootstrapButtonColor + ' calvin-btn dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' + options.buttonContent + '</a>';
        html += '<div class="dropdown-menu" aria-labelledby="dropdownMenuLink">';

        options.linkTypes.forEach(function(link) {
          if (options.linkTypes.indexOf(link) >= 0) {
            html += calvin.addLink(link, eventObj, options);
          }
        });
        html += '</div></div>';

      }

      el.innerHTML = html;
    });
  },

  addLink: function(linkType, eventObj, options, single) {
    var single = (typeof single !== 'undefined') ? single : false;
    switch (linkType) {
      case 'icalendar':
        var link = single ? '<a class="btn btn-' + options.bootstrapButtonColor + ' calvin-btn" href="'+ calvin.createICSLink(eventObj) +'" download="'+ eventObj.filename +' - ' + calvin.formatDates(eventObj.start, 'compressed') + '.ics">' + options.buttonContent + '</a>' : '<a class="dropdown-item calvin-link calvin-' + linkType + '" href="'+ calvin.createICSLink(eventObj) +'" download="'+ eventObj.filename +' - ' + calvin.formatDates(eventObj.start, 'compressed') + '.ics">iCalendar/Apple</a>';
        return link;
        break;
      case 'google':
        var link = single ? '<a class="btn btn-' + options.bootstrapButtonColor + ' calvin-btn" href="' + calvin.createGoogleLink(eventObj) + '" target="_blank">' + options.buttonContent + '</a>' : '<a class="dropdown-item calvin-link calvin-' + linkType + '" href="' + calvin.createGoogleLink(eventObj) + '" target="_blank">Google</a>';
        return link;
        break;
      case 'outlook':
        var link = single ? '<a class="btn btn-' + options.bootstrapButtonColor + ' calvin-btn" href="'+ calvin.createICSLink(eventObj) +'" download="'+ eventObj.filename +' - ' + calvin.formatDates(eventObj.start, 'compressed') + '.ics">' + options.buttonContent + '</a>' : '<a class="dropdown-item calvin-link calvin-' + linkType + '" href="'+ calvin.createICSLink(eventObj) +'" download="'+ eventObj.filename +' - ' + calvin.formatDates(eventObj.start, 'compressed') + '.ics">Outlook</a>';
        return link;
        break;
      case 'outlookcom':
        var link = single ? '<a class="btn btn-' + options.bootstrapButtonColor + ' calvin-btn" href="' + calvin.createOulookcomLink(eventObj) + '" target="_blank">' + options.buttonContent + '</a>' : '<a class="dropdown-item calvin-link calvin-' + linkType + '" href="' + calvin.createOulookcomLink(eventObj) + '" target="_blank">Outlook.com</a>';
        return link;
        break;
      case 'yahoo':
        var link = single ? '<a class="btn btn-' + options.bootstrapButtonColor + ' calvin-btn" href="' + calvin.createYahooLink(eventObj) + '" target="_blank">' + options.buttonContent + '</a>' : '<a class="dropdown-item calvin-link calvin-' + linkType + '" href="' + calvin.createYahooLink(eventObj) + '" target="_blank">Yahoo.com</a>';
        return link;
        break;
      default:
        return '';
    }
  },

  createICSLink: function(eventObj) {

    var SEPARATOR = (navigator.appVersion.indexOf('Win') !== -1) ? '\r\n' : '\n';

    var ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      'DTSTART:' + calvin.formatDates(eventObj.start) + 'Z',
      'DTEND:' + calvin.formatDates(eventObj.end) + 'Z',
      'SUMMARY:' + eventObj.title,
      'DESCRIPTION:' + eventObj.description,
      'LOCATION:' + eventObj.location,
      'END:VEVENT',
      'END:VCALENDAR'
    ];

    ics = ics.join(SEPARATOR);

    var blob = new Blob([ics], {type: 'text/x-vCalendar;charset=utf-8'});
    var downloadURL = URL.createObjectURL(blob);
    return downloadURL;
  },

  createGoogleLink: function(eventObj) {
    var googleLink = 'http://www.google.com/calendar/event?action=TEMPLATE&dates=' + calvin.formatDates(eventObj.start) + 'Z%2F' + calvin.formatDates(eventObj.end) + 'Z&text=' + encodeURIComponent(eventObj.title) + '&location=' + encodeURIComponent(eventObj.location) + '&details=' + encodeURIComponent(eventObj.description) + '&ctz=' + encodeURIComponent(eventObj.timezone);
    return googleLink
  },

  createOulookcomLink: function(eventObj) {
    var outlookLink = 'https://outlook.live.com/owa/?path=/calendar/action/compose&startdt=' + calvin.formatDates(eventObj.start) + '&enddt=' + calvin.formatDates(eventObj.end) + '&subject=' + encodeURIComponent(eventObj.title) +'&location=' + encodeURIComponent(eventObj.location) + '&body=' + encodeURIComponent(eventObj.description) + '&ctz=' + encodeURIComponent(eventObj.timezone);
    return outlookLink;
  },

  createYahooLink: function(eventObj) {
    calvin.eventDuration(eventObj);
    var yahooLink = 'https://calendar.yahoo.com/?v=60&view=d&type=20&title=' + encodeURIComponent(eventObj.title) + '&st=' + calvin.formatDates(eventObj.start) + 'Z&dur=' + calvin.eventDuration(eventObj) + '&desc=' + encodeURIComponent(eventObj.description) + '&in_loc=' + encodeURIComponent(eventObj.location);
    return yahooLink;
  },

  linkIcon: function(linkType) {
    switch (linkType) {
      case 'icalendar':
        var icon = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>';
        return icon;
        break;
        case 'google':
          var icon = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M113.47 309.408L95.648 375.94l-65.139 1.378C11.042 341.211 0 299.9 0 256c0-42.451 10.324-82.483 28.624-117.732h.014L86.63 148.9l25.404 57.644c-5.317 15.501-8.215 32.141-8.215 49.456.002 18.792 3.406 36.797 9.651 53.408z" fill="#fbbb00"/><path d="M507.527 208.176C510.467 223.662 512 239.655 512 256c0 18.328-1.927 36.206-5.598 53.451-12.462 58.683-45.025 109.925-90.134 146.187l-.014-.014-73.044-3.727-10.338-64.535c29.932-17.554 53.324-45.025 65.646-77.911h-136.89V208.176h245.899z" fill="#518ef8"/><path d="M416.253 455.624l.014.014C372.396 490.901 316.666 512 256 512c-97.491 0-182.252-54.491-225.491-134.681l82.961-67.91c21.619 57.698 77.278 98.771 142.53 98.771 28.047 0 54.323-7.582 76.87-20.818l83.383 68.262z" fill="#28b446"/><path d="M419.404 58.936l-82.933 67.896C313.136 112.246 285.552 103.82 256 103.82c-66.729 0-123.429 42.957-143.965 102.724l-83.397-68.276h-.014C71.23 56.123 157.06 0 256 0c62.115 0 119.068 22.126 163.404 58.936z" fill="#f14336"/></svg>';
          return icon;
          break;
        case 'outlook':
          var icon = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="103.173" height="104.313"><path d="M64.567 22.116v20.405l7.13 4.49c.188.054.596.058.784 0l30.688-20.69c0-2.45-2.284-4.205-3.573-4.205h-35.03z" fill="#0072c6"/><path d="M64.567 50.133l6.507 4.47c.917.674 2.022 0 2.022 0-1.101.674 30.077-20.036 30.077-20.036V72.07c0 4.083-2.613 5.795-5.551 5.795h-33.06v-27.73z" fill="#0072c6"/><g fill="#0072c6"><path d="M30.873 40.726c-2.218 0-3.985 1.042-5.29 3.123-1.304 2.08-1.958 4.834-1.958 8.263 0 3.479.654 6.229 1.959 8.25 1.304 2.026 3.016 3.033 5.132 3.033 2.182 0 3.914-.983 5.191-2.95 1.278-1.967 1.92-4.698 1.92-8.188 0-3.64-.619-6.473-1.861-8.498-1.242-2.022-2.938-3.033-5.093-3.033z"/><path d="M0 11.754V91.58l60.727 12.733V0L0 11.754zm40.636 53.408c-2.566 3.377-5.912 5.07-10.041 5.07-4.024 0-7.3-1.638-9.834-4.91-2.531-3.275-3.8-7.537-3.8-12.795 0-5.552 1.285-10.042 3.859-13.47 2.574-3.428 5.982-5.144 10.225-5.144 4.008 0 7.252 1.638 9.724 4.92 2.476 3.284 3.715 7.61 3.715 12.98.003 5.521-1.282 9.972-3.848 13.349z"/></g></svg>';
          return icon;
          break;
        case 'outlookcom':
          var icon = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="103.173" height="104.313"><path d="M64.567 22.116v20.405l7.13 4.49c.188.054.596.058.784 0l30.688-20.69c0-2.45-2.284-4.205-3.573-4.205h-35.03z" fill="#0072c6"/><path d="M64.567 50.133l6.507 4.47c.917.674 2.022 0 2.022 0-1.101.674 30.077-20.036 30.077-20.036V72.07c0 4.083-2.613 5.795-5.551 5.795h-33.06v-27.73z" fill="#0072c6"/><g fill="#0072c6"><path d="M30.873 40.726c-2.218 0-3.985 1.042-5.29 3.123-1.304 2.08-1.958 4.834-1.958 8.263 0 3.479.654 6.229 1.959 8.25 1.304 2.026 3.016 3.033 5.132 3.033 2.182 0 3.914-.983 5.191-2.95 1.278-1.967 1.92-4.698 1.92-8.188 0-3.64-.619-6.473-1.861-8.498-1.242-2.022-2.938-3.033-5.093-3.033z"/><path d="M0 11.754V91.58l60.727 12.733V0L0 11.754zm40.636 53.408c-2.566 3.377-5.912 5.07-10.041 5.07-4.024 0-7.3-1.638-9.834-4.91-2.531-3.275-3.8-7.537-3.8-12.795 0-5.552 1.285-10.042 3.859-13.47 2.574-3.428 5.982-5.144 10.225-5.144 4.008 0 7.252 1.638 9.724 4.92 2.476 3.284 3.715 7.61 3.715 12.98.003 5.521-1.282 9.972-3.848 13.349z"/></g></svg>';
          return icon;
          break;
        case 'yahoo':
          var icon = 'data:image/svg+xml;utf8,<svg width="188" height="211" xmlns="http://www.w3.org/2000/svg"><path fill="#5F01D1" fill-rule="nonzero" d="M0 .51h59.49l34.643 88.63L129.226.51h57.925L99.927 210.327H41.635l23.876-55.597z"/></svg>';
          return icon;
          break;
      default:
        return '';
    }
  },

  linkStyles: function(links) {
    var sheet = window.document.styleSheets[0];
    var rules;
    links.forEach(function(link) {
      rules = '.dropdown-item.calvin-' + link + ' {background-image: url(\'' + calvin.linkIcon(link) + '\');}';
      sheet.insertRule(rules, sheet.cssRules.length);
      rules = '.dropdown-item.calvin-' + link + ':hover {background: #e9ecef url(\'' + calvin.linkIcon(link) + '\');}';
      sheet.insertRule(rules, sheet.cssRules.length);
    });
    rules = '.dropdown-item.calvin-link, .dropdown-item.calvin-link:hover {background-size: 20px; background-repeat: no-repeat; background-position: 15px center; padding-left: 45px; padding-right: 35px;}';
    sheet.insertRule(rules, sheet.cssRules.length);
    sheet.insertRule('.calvin-btn.btn {padding: 0.375rem 1.4rem;}', sheet.cssRules.length);

  },

  formatDates: function(date, style) {
    var style = (typeof style !== 'undefined') ? style : 'formatted';
    var date = new Date(date);
    var offset = date.getTimezoneOffset();
    var timeAdjustment = offset * 60 * 1000;
    var timeOffset = ('00' + (offset / 60)).slice(-2) + ':00';
    var time = date.getTime() + timeAdjustment;
    date.setTime(time);
    var posNeg = offset > 0 ? '-' : '+';
    var year = date.getFullYear();
    var month = ('00' + (date.getMonth() + 1) ).slice(-2);
    var day = ('00' + date.getDate()).slice(-2);
    var hour = ('00' + date.getHours()).slice(-2);
    var mins = ('00' + date.getMinutes()).slice(-2);
    var formattedDate = '' + year + month + day + 'T' + hour + mins + '00';
    var offsetDate = year + month + day + 'T' + hour + ':' + mins + ':00' + posNeg + timeOffset;

    if (style == 'compressed') {
      return '' + year + month + day;
    } else {
      return formattedDate;
    }

  },

  eventDuration: function(eventObj) {
    var startDate = new Date(eventObj.start).getTime();
    var endDate = new Date(eventObj.end).getTime();
    var mins = (endDate - startDate) / 1000 / 60;
    var hours = ('00' + Math.floor(mins / 60)).slice(-2);
    var remainingMins = ('00' + mins % 60).slice(-2);
    var duration = hours + remainingMins;
    return duration
  }
};

export default calvin;
