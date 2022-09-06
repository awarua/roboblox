import numpy, scipy, scipy.optimize
import matplotlib
from mpl_toolkits.mplot3d import  Axes3D
from matplotlib import cm # to colormap 3D surfaces from blue to red
import matplotlib.pyplot as plt

graphWidth = 800 # units are pixels
graphHeight = 600 # units are pixels

# 3D contour plot lines
numberOfContourLines = 16


def SurfacePlot(func, data, fittedParameters):
    f = plt.figure(figsize=(graphWidth/100.0, graphHeight/100.0), dpi=100)

    matplotlib.pyplot.grid(True)
    axes = Axes3D(f)

    x_data = data[0]
    y_data = data[1]
    z_data = data[2]

    xModel = numpy.linspace(min(x_data), max(x_data), 20)
    yModel = numpy.linspace(min(y_data), max(y_data), 20)
    X, Y = numpy.meshgrid(xModel, yModel)

    Z = func(numpy.array([X, Y]), *fittedParameters)

    axes.plot_surface(X, Y, Z, rstride=1, cstride=1, cmap=cm.coolwarm, linewidth=1, antialiased=True)

    axes.scatter(x_data, y_data, z_data) # show data along with plotted surface

    axes.set_title('Surface Plot (click-drag with mouse)') # add a title for surface plot
    axes.set_xlabel('X Data') # X axis data label
    axes.set_ylabel('Y Data') # Y axis data label
    axes.set_zlabel('Z Data') # Z axis data label

    plt.show()
    plt.close('all') # clean up after using pyplot or else there can be memory and process problems


def ContourPlot(func, data, fittedParameters):
    f = plt.figure(figsize=(graphWidth/100.0, graphHeight/100.0), dpi=100)
    axes = f.add_subplot(111)

    x_data = data[0]
    y_data = data[1]
    z_data = data[2]

    xModel = numpy.linspace(min(x_data), max(x_data), 20)
    yModel = numpy.linspace(min(y_data), max(y_data), 20)
    X, Y = numpy.meshgrid(xModel, yModel)

    Z = func(numpy.array([X, Y]), *fittedParameters)

    axes.plot(x_data, y_data, 'o')

    axes.set_title('Contour Plot') # add a title for contour plot
    axes.set_xlabel('X Data') # X axis data label
    axes.set_ylabel('Y Data') # Y axis data label

    CS = matplotlib.pyplot.contour(X, Y, Z, numberOfContourLines, colors='k')
    matplotlib.pyplot.clabel(CS, inline=1, fontsize=10) # labels for contours

    plt.show()
    plt.close('all') # clean up after using pyplot or else there can be memory and process problems


def ScatterPlot(data):
    f = plt.figure(figsize=(graphWidth/100.0, graphHeight/100.0), dpi=100)

    matplotlib.pyplot.grid(True)
    axes = Axes3D(f)
    x_data = data[0]
    y_data = data[1]
    z_data = data[2]

    axes.scatter(x_data, y_data, z_data)

    axes.set_title('Scatter Plot (click-drag with mouse)')
    axes.set_xlabel('X Data')
    axes.set_ylabel('Y Data')
    axes.set_zlabel('Z Data')

    plt.show()
    plt.close('all') # clean up after using pyplot or else there can be memory and process problems


def func2(data, a, b, c):
    x = data[0]
    y = data[1]
    return (a * x) + (y * b) + c

def func(data, a, b, c, d, e, f, g, h):
    x = data[0]
    y = data[1]
    return (a * x**3) + (b * x**2) + (c * x) + d + (e * y**3) + (f * y**2) + (g * y) + h

if __name__ == "__main__":

    # Cols.
    xData = numpy.array([
      1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,
      2.0,2.0,2.0,2.0,2.0,2.0,2.0,2.0,2.0,2.0,
      3.0,3.0,3.0,3.0,3.0,3.0,3.0,3.0,3.0,3.0,
      4.0,4.0,4.0,4.0,4.0,4.0,4.0,4.0,4.0,4.0,
      5.0,5.0,5.0,5.0,5.0,5.0,5.0,5.0,5.0,5.0,
      6.0,6.0,6.0,6.0,6.0,6.0,6.0,6.0,6.0,6.0,
      7.0,7.0,7.0,7.0,7.0,7.0,7.0,7.0,7.0,7.0,
      8.0,8.0,8.0,8.0,8.0,8.0,8.0,8.0,8.0,8.0,
      9.0,9.0,9.0,9.0,9.0,9.0,9.0,9.0,9.0,9.0,
      10.0,10.0,10.0,10.0,10.0,10.0,10.0,10.0,10.0,10.0
    ])

    # Rows.
    yData = numpy.array([
      1.0,2.0,3.0,4.0,5.0,6.0,7.0,8.0,9.0,10.0,
      1.0,2.0,3.0,4.0,5.0,6.0,7.0,8.0,9.0,10.0,
      1.0,2.0,3.0,4.0,5.0,6.0,7.0,8.0,9.0,10.0,
      1.0,2.0,3.0,4.0,5.0,6.0,7.0,8.0,9.0,10.0,
      1.0,2.0,3.0,4.0,5.0,6.0,7.0,8.0,9.0,10.0,
      1.0,2.0,3.0,4.0,5.0,6.0,7.0,8.0,9.0,10.0,
      1.0,2.0,3.0,4.0,5.0,6.0,7.0,8.0,9.0,10.0,
      1.0,2.0,3.0,4.0,5.0,6.0,7.0,8.0,9.0,10.0,
      1.0,2.0,3.0,4.0,5.0,6.0,7.0,8.0,9.0,10.0,
      1.0,2.0,3.0,4.0,5.0,6.0,7.0,8.0,9.0,10.0,
    ])

    zData = numpy.array([
      1.436,2.3,3.166,4.032,4.898,5.764,6.232,7.496,8.364,9.228,
      0.752,1.184,1.618,2.05,2.484,2.914,3.35,3.782,4.216,4.648,
      0.524,0.812,1.102,1.39,1.678,1.968,2.256,2.546,2.832,3.122,
      0.41,0.626,0.842,1.06,1.276,1.492,1.708,1.924,2.142,2.358,
      0.342,0.514,0.688,0.86,1.036,1.208,1.382,1.554,1.726,1.9,
      0.296,0.44,0.584,0.73,0.872,1.018,1.162,1.306,1.452,1.594,
      0.264,0.388,0.512,0.636,0.758,0.884,1.006,1.128,1.252,1.378,
      0.238,0.346,0.456,0.564,0.672,0.78,0.888,0.996,1.106,1.212,
      0.22,0.316,0.412,0.508,0.604,0.7,0.796,0.894,0.99,1.086,
      0.204,0.292,0.378,0.466,0.552,0.64,0.724,0.81,0.898,0.984
    ])

    # xData = numpy.array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0])
    # yData = numpy.array([11.0, 12.1, 13.0, 14.1, 15.0, 16.1, 17.0, 18.1, 90.0])
    # zData = numpy.array([1.1, 2.2, 3.3, 4.4, 5.5, 6.6, 7.7, 8.0, 9.9])

    data = [xData, yData, zData]

    initialParameters = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0] # these are the same as scipy default values in this example

    # here a non-linear surface fit is made with scipy's curve_fit()
    fittedParameters, pcov = scipy.optimize.curve_fit(
      func, [xData, yData], zData, p0 = initialParameters)

    ScatterPlot(data)
    SurfacePlot(func, data, fittedParameters)
    ContourPlot(func, data, fittedParameters)

    print('fitted prameters', fittedParameters)

    modelPredictions = func(data, *fittedParameters) 

    absError = modelPredictions - zData

    SE = numpy.square(absError) # squared errors
    MSE = numpy.mean(SE) # mean squared errors
    RMSE = numpy.sqrt(MSE) # Root Mean Squared Error, RMSE
    Rsquared = 1.0 - (numpy.var(absError) / numpy.var(zData))
    print('RMSE:', RMSE)
    print('R-squared:', Rsquared)