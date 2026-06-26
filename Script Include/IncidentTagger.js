var IncidentTagger = Class.create();

IncidentTagger.prototype = {

    initialize: function() {
        this.mappings = [
            {
                keywords: ['vpn', 'remote access', 'cisco anyconnect', 'pulse secure', 'tunnel'],
                category: 'network',
                subcategory: 'vpn',
                assignment_group: 'Network Support',
                confidence: 'high'
            },
            {
                keywords: ['wifi', 'wireless', 'wi-fi', 'ssid', 'access point', 'no internet', 'internet down'],
                category: 'network',
                subcategory: 'wireless',
                assignment_group: 'Network Support',
                confidence: 'high'
            },
            {
                keywords: ['password', 'reset password', 'forgot password', 'locked out', 'account locked', 'cannot login', "can't login", 'login failed'],
                category: 'software',
                subcategory: 'account_management',
                assignment_group: 'IT Help Desk',
                confidence: 'high'
            },
            {
                keywords: ['outlook', 'email not working', 'cannot send email', "can't receive", 'mailbox', 'exchange'],
                category: 'software',
                subcategory: 'email',
                assignment_group: 'Messaging Support',
                confidence: 'high'
            },
            {
                keywords: ['laptop', 'computer slow', 'pc crash', 'blue screen', 'bsod', 'not turning on', 'keyboard', 'mouse', 'screen broken'],
                category: 'hardware',
                subcategory: 'desktop',
                assignment_group: 'Hardware Support',
                confidence: 'high'
            },
            {
                keywords: ['printer', 'print', 'scanner', 'printing issue', 'paper jam'],
                category: 'hardware',
                subcategory: 'printer',
                assignment_group: 'Hardware Support',
                confidence: 'medium'
            },
            {
                keywords: ['software install', 'install application', 'license', 'software not working', 'application crash', 'app error'],
                category: 'software',
                subcategory: 'application',
                assignment_group: 'Software Support',
                confidence: 'medium'
            },
            {
                keywords: ['server down', 'server error', 'database', 'service unavailable', '503', '502', 'timeout', 'outage'],
                category: 'software',
                subcategory: 'server',
                assignment_group: 'Infrastructure Support',
                confidence: 'high'
            },
            {
                keywords: ['access request', 'permission', 'unauthorized', 'access denied', 'forbidden', 'role'],
                category: 'software',
                subcategory: 'access',
                assignment_group: 'IT Help Desk',
                confidence: 'medium'
            },
            {
                keywords: ['mobile', 'phone', 'iphone', 'android', 'teams app', 'mobile device'],
                category: 'hardware',
                subcategory: 'mobile',
                assignment_group: 'Mobile Support',
                confidence: 'medium'
            },
            {
                keywords: ['teams', 'microsoft teams', 'video call', 'meeting', 'collaboration'],
                category: 'software',
                subcategory: 'collaboration',
                assignment_group: 'Software Support',
                confidence: 'medium'
            },
            {
                keywords: ['slow', 'performance', 'lagging', 'freezing', 'unresponsive'],
                category: 'hardware',
                subcategory: 'performance',
                assignment_group: 'Hardware Support',
                confidence: 'low'
            }
        ];
    },

    classify: function(shortDescription) {
        if (!shortDescription) {
            return this._noMatch();
        }

        var text = shortDescription.toLowerCase().trim().replace(/\s+/g, ' ');

        var bestMatch = null;
        var bestScore = 0;

        for (var i = 0; i < this.mappings.length; i++) {
            var mapping = this.mappings[i];
            var score = this._scoreMapping(text, mapping.keywords);

            if (score > bestScore) {
                bestScore = score;
                bestMatch = mapping;
            }
        }

        if (bestScore === 0 || !bestMatch) {
            return this._noMatch();
        }

        return {
            matched: true,
            category: bestMatch.category,
            subcategory: bestMatch.subcategory,
            assignment_group: bestMatch.assignment_group,
            confidence: bestMatch.confidence,
            score: bestScore,
            matched_keywords: this._getMatchedKeywords(text, bestMatch.keywords)
        };
    },

    _scoreMapping: function(text, keywords) {
        var score = 0;
        for (var k = 0; k < keywords.length; k++) {
            if (text.indexOf(keywords[k]) !== -1) {
                score++;
            }
        }
        return score;
    },

    _getMatchedKeywords: function(text, keywords) {
        var matched = [];
        for (var k = 0; k < keywords.length; k++) {
            if (text.indexOf(keywords[k]) !== -1) {
                matched.push(keywords[k]);
            }
        }
        return matched.join(', ');
    },

    _noMatch: function() {
        return {
            matched: false,
            category: '',
            subcategory: '',
            assignment_group: '',
            confidence: 'none',
            score: 0,
            matched_keywords: ''
        };
    },

    type: 'IncidentTagger'
};