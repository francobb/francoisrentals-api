import ReportService from '../../../src/services/report.service';

describe('Report Service', () => {
  it('should be defined', () => {
    expect(ReportService).toBeDefined();
  });
  it('should be a function', () => {
    expect(typeof ReportService).toBe('function');
  });
  it('should return a string', () => {
    expect(typeof new ReportService()).toBe('object');
  });

  // it('should return the correct string', () => {
  //   expect(new ReportService()).toBe({ reports: expect.any(Object) });
  // });

  // xdescribe('addReport()', () => {
  //   it('should not return an error', async () => {
  //     logger.error = jest.fn();
  //     const insertManyMock = jest.spyOn(mReportsRepository, 'insertMany').mockImplementationOnce((data, callback: Function) => {
  //       callback(null, 'success');
  //     });
  //     await transactionsService.addReport(fileData);
  //     expect(logger.error).not.toHaveBeenCalled();
  //     expect(insertManyMock).toHaveBeenCalledWith(
  //       {
  //         data: 'fakePDF',
  //         month: 'Mar',
  //         year: '2023',
  //       },
  //       expect.any(Function),
  //     );
  //   });
  //
  //   it('should return an error', async () => {
  //     logger.error = jest.fn();
  //     const error = new Error('Insertion failed');
  //     const insertManyMock = jest.spyOn(mReportsRepository, 'insertMany').mockImplementationOnce((data, callback: Function) => {
  //       callback(error);
  //     });
  //     await transactionsService.addReport(fileData);
  //     expect(insertManyMock).toHaveBeenCalledWith({ data: 'fakePDF', month: 'Mar', year: '2023' }, expect.any(Function));
  //     expect(logger.error).toHaveBeenCalled();
  //   });
  // });
  //
  // xdescribe('getAllReports()', function () {
  //   it('should return all reports', async () => {
  //     jest.spyOn(mReportsRepository, 'find').mockReturnValueOnce([]);
  //     await transactionsService.getAllReports();
  //     expect(mReportsRepository.find).toBeCalled();
  //   });
  // });
});
