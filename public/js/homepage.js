async function postToTimeline() {
    const params = getValues('div#postToTimeLine ', ['subject', 'text', 'topic_id']);

    const response = await callServer('POST', '/post/add', params);
    if (response === 'succeeded') {
        window.location.href = '/user/homepage';
    }
}