import React from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles(theme => ({
    root: {
        height: '100vh',
    },
    image: {
        backgroundImage: 'url(https://scontent-syd2-1.xx.fbcdn.net/v/t1.0-9/53186695_2349304575356391_8862513931231428608_n.jpg?_nc_cat=102&_nc_eui2=AeEumhfpny3ZFbPDn9MvxckM7ZSPDcirUmJ4TouaOcW9p_Ws_kkdocBromqAIGIOtZ9PmsSSRlPO8C2V_L50d0UAhnXMD4eaAUFowCY4sSHlfA&_nc_oc=AQkzHtnbB8efWm0z2n6v8ZwME0lJMDAcFyCLlwq82mLaKSyxHxH2pyyskGJ9QZaVjto&_nc_ht=scontent-syd2-1.xx&oh=9c7df27d880aad6ee3c62bc4716da952&oe=5DF63A26)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    paper: {
        margin: theme.spacing(8, 4),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'left',
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

export default function Product() {
    const classes = useStyles();

    return (
        <Grid container component="main" className={classes.root}>
            <CssBaseline />
            <Grid item xs={false} sm={4} md={7} className={classes.image} />
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                <div className={classes.paper}>
                    <Typography component="h1" variant="h4">
                        Mitchell
                    </Typography>
                    <Typography component="h4" variant="h5">
                        $299
                    </Typography>
                    <p>Lorem ipsum this is an ecommerce page in my honest opinion its pretty epic</p>
                    <form className={classes.form} noValidate>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >
                            Purchase
                        </Button>
                    </form>
                </div>
            </Grid>
        </Grid>
    );
}