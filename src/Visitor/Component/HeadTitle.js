function HeadTitle({title}) {
    return (
        <>
            <p className="h2 fw-bold d-flex align-items-start justify-content-center"><span>{title}</span><img src={require('../assets/plus_head.png')} alt="header title plus image" /></p>
        </>
    )
}

export default HeadTitle