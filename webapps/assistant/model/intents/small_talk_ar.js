!(function (exports) {
  'use strict';

  function getAge(dateString) {
    const today = new Date();
    const date = new Date(dateString);

    const timeDiff = today - date;
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) return years === 1 ? 'عمره سنة واحدة' : `${years} سنوات`;
    if (months > 0) return months === 1 ? 'عمره شهر واحد' : `${months} أشهر`;
    if (days > 0) return days === 1 ? 'عمره يوم واحد' : `${days} أيام`;
    if (hours > 0) return hours === 1 ? 'عمره ساعة واحدة' : `${hours} ساعات`;
    if (minutes > 0) return minutes === 1 ? 'عمره دقيقة واحدة' : `${minutes} دقائق`;
    if (seconds > 0) return seconds === 1 ? 'عمره ثانية واحدة' : `${seconds} ثواني`;

    return 'تم إنشاؤه للتو';
  }

  const creationDate = getAge('07-21-2023T13:58:00');

  const SMALL_TALK_INTENTS = [
    { pattern: /(مرحبا|السلام عليكم)/i, reply: `مرحبا!` },
    { pattern: /(كيف\s+حالك|كيف\s+حالكم)/i, reply: 'أنا بخير، شكرًا! وأنت/أنتم؟' },
    { pattern: /(ما\s+الأخبار|ما\s+الجديد)/i, reply: 'لا الجديد، أنا هنا للمساعدة. كيف يمكنني مساعدتك؟' },
    { pattern: /(من\s+أنت|من\s+هو\s+صانعك)/i, reply: 'أنا روبوت دردشة ودود مصمم لمساعدتك!' },
    { pattern: /(من\s+أين\s+أنت)/i, reply: 'أنا موجود في العالم الرقمي، هنا لمساعدتك!' },
    { pattern: /(شكراً|شكراً جزيلاً|شكرًا)/i, reply: 'عفوًا!' },
    { pattern: /(مع\s+السلامة|أراك\s+لاحقاً|باي)/i, reply: `وداعاً!` },
    { pattern: /(أخبرني\s+عن\s+نفسك|من\s+أنت)/i, reply: 'أنا مساعد أوركيد! تم تصميمي لمساعدتك في مجموعة متنوعة من المهام والإجابة على الأسئلة.' },
    { pattern: /(ماذا\s+تستطيع\s+أن\s+تفعل)/i, reply: 'أستطيع مساعدتك في مجموعة واسعة من المهام بما في ذلك الإجابة على الأسئلة وتوفير المعلومات وأكثر من ذلك.' },
    { pattern: /(ما\s+عمرك)/i, reply: `ليس لدي عمر، لأنني مجرد مساعد لك. ولكن إذا كنت تتحدث عن عمر التطبيق الذي أعمل من خلاله، فإنه ${creationDate}` },
    { pattern: /(ما\s+لون\s+مفضل\s+لديك)/i, reply: 'ليس لدي تفضيلات شخصية، ولكن أنا هنا لمساعدتك في أسئلتك!' },
    { pattern: /(أخبرني\s+نكتة)/i, reply: 'بالطبع! إليك نكتة: لماذا لا يثق العلماء في الذرات؟ لأنها تشكل كل شيء!' },
    { pattern: /(من\s+هو\s+صانع\s+أو\s+مبدع\s+أوركيد)/i, reply: 'تم إنشاؤي بواسطة أوركيد، منظمة تضم مطورين متحمسين!' },
    { pattern: /(ما\s+هو\s+معنى\s+الحياة)/i, reply: 'معنى الحياة هو سؤال فلسفي. لديها منظورات مختلفة من قبل الناس.' },
    { pattern: /(هل\s+لديك\s+لقب\s+أو\s+اسم\s+أخر)/i, reply: 'يمكنك أن تسميني مساعد أوركيد إذا أردت!' },
    { pattern: /(هل\s+أنت\s+إنسان)/i, reply: 'لا، أنا لست إنسانًا. أنا برنامج كمبيوتر تم تصميمه لمساعدتك!' },
    { pattern: /(هل\s+تستطيع\s+الرقص)/i, reply: 'ليس لدي هيئة بدنية، لذا لا يمكنني الرقص. ولكن يمكنني توفير معلومات حول الرقص!' },
    { pattern: /(ماهي\s+اللغات\s+التي\s+تتحدث\s+بها)/i, reply: 'أنا ماهر في اللغة الإنجليزية، ولكن يمكنني فهم وإنشاء النصوص في العديد من اللغات!' },
    { pattern: /(ماهو\s+كتابك\s+المفضل)/i, reply: 'ليس لدي تفضيلات شخصية، ولكن هناك العديد من الكتب الرائعة هناك! ما هو كتابك المفضل؟' }
  ];

  chatbot.addIntents(SMALL_TALK_INTENTS);
})(window);
