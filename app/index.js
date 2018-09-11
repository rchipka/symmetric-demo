var $title   = $('<input type="text">').appendTo(document.body),
    $content = $('<textarea>').appendTo(document.body),
    $button  = $('<input type="submit">').appendTo(document.body),
    $list    = $('<ul>').appendTo(document.body),
    index    = 0;

function loadEntries() {
    console.log('index', index);
    console.log('entries', entries.length);
    for (; index < entries.length; index++) {
        console.log('enter loop');
        var entry = entries[index];
        console.log('entry', entry);

        $list.append(`
            <li>
                <h2>${entry.title}</h2>
                <p>${entry.content}</p>
            </li>
        `);
    }
}

loadEntries();

$button.on('click', function () {
    var title   = $title.val(),
        content = $content.val();

    if (!title) {
        console.log('no title');
        alert('please enter a title');
        return;
    }

    if (entries.some(function (e) {
        console.log('TITLE', e.title, title);
        return e.title == title;
    })) {
        alert('please enter a unique title');
        return;
    }
    console.log('ENTRIES', entries);

    entries.push({
        title,
        content
    });

    console.log('ENTRIES', entries);
    loadEntries();
});

// setInterval(loadEntries, 2500);